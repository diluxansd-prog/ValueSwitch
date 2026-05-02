/**
 * Pulls FAQ-eligible question/answer pairs out of a markdown article.
 * Used to auto-generate FAQPage schema for guide pages — gives them a
 * shot at Google's FAQ rich snippet without hand-curating.
 *
 * Detection rules:
 * 1. Any H2 or H3 ending in `?` → counted as a question
 * 2. Body = the text up to the next H2/H3, with markdown links/emphasis stripped
 * 3. Answers shorter than 40 chars or longer than 1000 chars are skipped
 *    (Google rejects very short/long FAQ answers in rich results)
 * 4. We cap at 8 questions per article — beyond that Google ignores them anyway
 *
 * The extractor is intentionally conservative: false-positive FAQ schema
 * gets you penalised by Google, false-negative just means no rich result.
 */

interface FaqPair {
  question: string;
  answer: string;
}

const MIN_ANSWER_CHARS = 40;
const MAX_ANSWER_CHARS = 1000;
const MAX_FAQS = 8;

/** Strip markdown to plaintext suitable for FAQ schema's `Answer.text` */
function plainText(md: string): string {
  return md
    // Remove markdown links → keep just the link text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Strip bold/italic markers
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    // Strip inline code
    .replace(/`([^`]+)`/g, "$1")
    // Strip HTML tags if any leaked in
    .replace(/<[^>]+>/g, "")
    // Collapse multiple newlines
    .replace(/\n{2,}/g, "\n")
    // Strip list bullets and table pipes (FAQ answers should read as prose)
    .replace(/^[\s]*[-*]\s+/gm, "")
    .replace(/^\s*\|.*$/gm, "")
    .trim();
}

export function extractFAQs(markdown: string): FaqPair[] {
  // Split into sections at H2 / H3 boundaries
  const lines = markdown.split("\n");
  const faqs: FaqPair[] = [];

  let currentHeading: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    if (!currentHeading) return;
    const isQuestion = currentHeading.trim().endsWith("?");
    if (!isQuestion) {
      currentHeading = null;
      currentBody = [];
      return;
    }
    const body = plainText(currentBody.join("\n"));
    if (body.length >= MIN_ANSWER_CHARS && body.length <= MAX_ANSWER_CHARS) {
      faqs.push({
        question: currentHeading.trim(),
        answer: body,
      });
    }
    currentHeading = null;
    currentBody = [];
  };

  for (const line of lines) {
    const m = line.match(/^#{2,3}\s+(.+)$/);
    if (m) {
      flush();
      currentHeading = m[1];
      currentBody = [];
    } else if (currentHeading) {
      currentBody.push(line);
    }
  }
  flush();

  return faqs.slice(0, MAX_FAQS);
}

/**
 * For step-by-step guides, pull H2/H3 sections that look like steps
 * (numbered or imperative-tone) into a HowTo schema.
 */
export function extractHowToSteps(
  markdown: string
): { name: string; text: string }[] {
  const lines = markdown.split("\n");
  const steps: { name: string; text: string }[] = [];

  let currentHeading: string | null = null;
  let currentBody: string[] = [];

  const isStepLike = (heading: string) => {
    // Numbered step ("1. Sign up", "Step 1: ..."), or imperative
    if (/^\d+[.):]\s/.test(heading)) return true;
    if (/^step\s+\d+/i.test(heading)) return true;
    return false;
  };

  const flush = () => {
    if (!currentHeading) return;
    if (isStepLike(currentHeading)) {
      const body = plainText(currentBody.join("\n"));
      if (body.length >= 20) {
        steps.push({
          name: currentHeading.replace(/^\d+[.):]\s*/, "").replace(/^step\s+\d+:?\s*/i, "").trim(),
          text: body.slice(0, 500),
        });
      }
    }
    currentHeading = null;
    currentBody = [];
  };

  for (const line of lines) {
    const m = line.match(/^#{2,3}\s+(.+)$/);
    if (m) {
      flush();
      currentHeading = m[1];
      currentBody = [];
    } else if (currentHeading) {
      currentBody.push(line);
    }
  }
  flush();

  return steps;
}
