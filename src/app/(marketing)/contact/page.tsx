import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with ValueSwitch. We're here to help with any questions about comparing, switching or saving money on your household bills.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a365d] to-[#2a4a7f] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Have a question or need help? Our team is here to assist you. Get in
            touch and we will respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold">Send Us a Message</h2>
            <ContactForm />
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Get in Touch</h2>

            <Card>
              <CardContent className="space-y-6 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <a
                      href="mailto:support@valueswitch.co.uk"
                      className="text-sm text-muted-foreground hover:text-[#1a365d] hover:underline"
                    >
                      support@valueswitch.co.uk
                    </a>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Phone</p>
                    <a
                      href="tel:08001234567"
                      className="text-sm text-muted-foreground hover:text-[#1a365d] hover:underline"
                    >
                      0800 123 4567
                    </a>
                    <p className="text-xs text-muted-foreground">
                      Mon-Fri 9am-6pm, Sat 10am-4pm
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      ValueSwitch Ltd
                      <br />
                      123 Comparison Street
                      <br />
                      London, EC2A 1NT
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card className="border-2 border-[#38a169]/20 bg-[#38a169]/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="mt-0.5 size-5 shrink-0 text-[#38a169]" />
                  <div>
                    <p className="font-medium">Looking for quick answers?</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Check our frequently asked questions for instant help with
                      common queries.
                    </p>
                    <Link
                      href="/faq"
                      className="mt-3 inline-block text-sm font-medium text-[#38a169] hover:underline"
                    >
                      Visit our FAQ page
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
