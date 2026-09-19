/**
 * Streaming Awin feed reader.
 *
 * Feeds are downloaded, gunzipped and split into CSV records as a stream,
 * so a function never holds the compressed bytes, the decompressed bytes
 * and the decoded string of a whole network feed at the same time. Peak
 * memory for the combined multi-FID feed is now just the records kept.
 *
 * Records are assembled with quote parity, so quoted fields containing
 * newlines (product descriptions) stay inside one record.
 */

export interface StreamedCsv {
  header: string;
  /** Records kept, in feed order (all records when no MID filter). */
  records: string[];
  /** Kept records grouped by matching MID (only when a filter was given). */
  byMid: Map<string, string[]>;
  bytes: number;
}

function countQuotes(s: string): number {
  let n = 0;
  let i = s.indexOf('"');
  while (i !== -1) {
    n++;
    i = s.indexOf('"', i + 1);
  }
  return n;
}

/** A record mentions a merchant if the MID appears as a whole CSV field.
 *  False positives are harmless: the importer re-checks merchant_id. */
function matchingMids(record: string, mids: string[]): string[] {
  const hits: string[] = [];
  for (const mid of mids) {
    if (
      record.includes(`"${mid}"`) ||
      record.includes(`,${mid},`) ||
      record.startsWith(`${mid},`) ||
      record.endsWith(`,${mid}`)
    ) {
      hits.push(mid);
    }
  }
  return hits;
}

/**
 * @param mids When given, only records mentioning one of these MIDs are
 *             kept (grouped in `byMid`). When null, every record is kept.
 */
export async function streamFeedCsv(
  url: string,
  mids: string[] | null
): Promise<StreamedCsv> {
  const res = await fetch(url, {
    headers: { "User-Agent": "ValueSwitchBot/1.0 (+https://valueswitch.co.uk)" },
  });
  if (!res.ok || !res.body) {
    throw new Error(`Feed fetch failed: HTTP ${res.status}`);
  }

  // Peek at the first chunk: Awin serves gzip files (magic 1f 8b), but a
  // server may also have decompressed it already via Content-Encoding.
  const rawReader = res.body.getReader();
  const first = await rawReader.read();
  let bytes = first.value?.byteLength ?? 0;
  const isGzip =
    !!first.value && first.value[0] === 0x1f && first.value[1] === 0x8b;

  const replay = new ReadableStream<Uint8Array>({
    start(controller) {
      if (first.value) controller.enqueue(first.value);
      if (first.done) controller.close();
    },
    async pull(controller) {
      const { done, value } = await rawReader.read();
      if (done) {
        controller.close();
        return;
      }
      bytes += value.byteLength;
      controller.enqueue(value);
    },
    cancel(reason) {
      return rawReader.cancel(reason);
    },
  });

  const decompressed = isGzip
    ? replay.pipeThrough(
        new DecompressionStream("gzip") as unknown as TransformStream<
          Uint8Array,
          Uint8Array
        >
      )
    : replay;
  const textReader = decompressed
    .pipeThrough(
      new TextDecoderStream() as unknown as TransformStream<Uint8Array, string>
    )
    .getReader();

  let header: string | null = null;
  const records: string[] = [];
  const byMid = new Map<string, string[]>();
  let pending = ""; // a record whose quotes are still open
  let pendingQuotes = 0;
  let carry = ""; // partial line at the end of a chunk

  const onRecord = (rec: string) => {
    if (rec.endsWith("\r")) rec = rec.slice(0, -1);
    if (header === null) {
      header = rec;
      return;
    }
    if (!rec) return;
    if (!mids) {
      records.push(rec);
      return;
    }
    const hits = matchingMids(rec, mids);
    if (hits.length === 0) return;
    records.push(rec);
    for (const mid of hits) {
      const list = byMid.get(mid);
      if (list) list.push(rec);
      else byMid.set(mid, [rec]);
    }
  };

  const onLine = (line: string) => {
    if (pendingQuotes % 2 === 1) {
      pending += "\n" + line;
    } else {
      pending = line;
      pendingQuotes = 0;
    }
    pendingQuotes += countQuotes(line);
    if (pendingQuotes % 2 === 0) {
      onRecord(pending);
      pending = "";
      pendingQuotes = 0;
    }
  };

  for (;;) {
    const { done, value } = await textReader.read();
    if (done) break;
    const text = carry + value;
    let start = 0;
    let nl = text.indexOf("\n", start);
    while (nl !== -1) {
      onLine(text.slice(start, nl));
      start = nl + 1;
      nl = text.indexOf("\n", start);
    }
    carry = text.slice(start);
  }
  if (carry) onLine(carry);
  if (pending) onRecord(pending);

  return { header: header ?? "", records, byMid, bytes };
}

/** Rebuild a CSV string from a header and a record subset. */
export function toCsv(header: string, records: string[]): string {
  return records.length ? `${header}\n${records.join("\n")}` : header;
}
