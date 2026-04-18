"use client";

import { useState } from "react";
import { Copy, ExternalLink, Check, Link2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  AWIN_MERCHANTS,
  MERCHANT_HOMEPAGES,
  generateAwinLink,
  detectMerchantFromUrl,
  type AwinMerchantSlug,
} from "@/lib/affiliate";

export function LinkGenerator() {
  const [merchant, setMerchant] = useState<AwinMerchantSlug>("vodafone");
  const [destinationUrl, setDestinationUrl] = useState(
    MERCHANT_HOMEPAGES.vodafone
  );
  const [clickref, setClickref] = useState("");
  const [copied, setCopied] = useState(false);

  const generatedLink = generateAwinLink({
    merchantId: AWIN_MERCHANTS[merchant],
    destinationUrl: destinationUrl.trim() || MERCHANT_HOMEPAGES[merchant],
    clickref: clickref.trim() || undefined,
  });

  // Auto-detect merchant when user pastes a URL
  function handleUrlChange(url: string) {
    setDestinationUrl(url);
    const detected = detectMerchantFromUrl(url);
    if (detected && detected !== merchant) {
      setMerchant(detected);
      toast.success(`Auto-detected: ${detected}`);
    }
  }

  function handleMerchantChange(slug: AwinMerchantSlug) {
    setMerchant(slug);
    // If current destination doesn't match, reset to merchant's homepage
    const currentDetected = detectMerchantFromUrl(destinationUrl);
    if (currentDetected !== slug) {
      setDestinationUrl(MERCHANT_HOMEPAGES[slug]);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  const examples = [
    {
      label: "Homepage",
      url: MERCHANT_HOMEPAGES[merchant],
    },
    {
      label: "SIM-only deals (Vodafone)",
      url: "https://www.vodafone.co.uk/mobile/best-sim-only-deals",
      merchant: "vodafone" as AwinMerchantSlug,
    },
    {
      label: "Pay monthly phones (Vodafone)",
      url: "https://www.vodafone.co.uk/mobile/phones",
      merchant: "vodafone" as AwinMerchantSlug,
    },
    {
      label: "Talkmobile SIMs",
      url: "https://talkmobile.co.uk/sim-only-deals",
      merchant: "talkmobile" as AwinMerchantSlug,
    },
    {
      label: "Lebara SIMs",
      url: "https://www.lebara.co.uk/en/mobile/plans/sim-only-plans.html",
      merchant: "lebara" as AwinMerchantSlug,
    },
  ];

  const clickrefSuggestions = [
    "homepage_banner",
    "hero_cta",
    "compare_page",
    "deal_page",
    "email_newsletter",
    "social_twitter",
    "social_facebook",
    "social_instagram",
    "blog_article",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Link2 className="size-7" />
          Affiliate Link Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate tracked Awin affiliate links for any page on your partner
          merchants. Uses the <code className="text-xs bg-muted px-1 rounded">cread</code>{" "}
          format.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Generate Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Merchant */}
            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant</Label>
              <Select
                value={merchant}
                onValueChange={(v) => handleMerchantChange(v as AwinMerchantSlug)}
              >
                <SelectTrigger id="merchant">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vodafone">
                    Vodafone (MID 1257)
                  </SelectItem>
                  <SelectItem value="talkmobile">
                    Talkmobile (MID 2351)
                  </SelectItem>
                  <SelectItem value="ttfone">TTfone (MID 28737)</SelectItem>
                  <SelectItem value="lebara">Lebara (MID 30681)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Destination URL */}
            <div className="space-y-2">
              <Label htmlFor="destination">
                Destination URL
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (paste any page on the merchant&apos;s site)
                </span>
              </Label>
              <Input
                id="destination"
                value={destinationUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.vodafone.co.uk/..."
              />
            </div>

            {/* ClickRef */}
            <div className="space-y-2">
              <Label htmlFor="clickref">
                ClickRef
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (optional — tracks which source the click came from)
                </span>
              </Label>
              <Input
                id="clickref"
                value={clickref}
                onChange={(e) => setClickref(e.target.value)}
                placeholder="e.g. homepage_banner"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {clickrefSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setClickref(s)}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-border/60 hover:bg-muted transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Generated link */}
            <div className="space-y-2 pt-2 border-t">
              <Label>Generated Affiliate Link</Label>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/40 font-mono text-xs break-all">
                {generatedLink}
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={copyLink} className="flex-1">
                  {copied ? (
                    <>
                      <Check className="size-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href={generatedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" />
                    Test
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info sidebar */}
        <div className="space-y-4">
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="size-5 shrink-0 text-blue-500 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p className="font-semibold">How to use</p>
                  <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                    <li>Browse merchant site, find the page you want</li>
                    <li>Copy the full URL</li>
                    <li>Paste it above (merchant is auto-detected)</li>
                    <li>Optional: add a clickref label</li>
                    <li>Copy & use anywhere — social, email, ads</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {examples.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => {
                    setDestinationUrl(ex.url);
                    if (ex.merchant) setMerchant(ex.merchant);
                  }}
                  className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors text-xs"
                >
                  <p className="font-medium">{ex.label}</p>
                  <p className="text-muted-foreground truncate mt-0.5">
                    {ex.url}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Your Awin IDs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Publisher</span>
                <Badge variant="outline" className="font-mono">
                  2798806
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vodafone</span>
                <Badge variant="outline" className="font-mono">
                  1257
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Talkmobile</span>
                <Badge variant="outline" className="font-mono">
                  2351
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TTfone</span>
                <Badge variant="outline" className="font-mono">
                  28737
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lebara</span>
                <Badge variant="outline" className="font-mono">
                  30681
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
