import { RiCheckLine, RiCloseLine, RiSearchLine } from "@remixicon/react";
import Header from "@/components/header";
import * as Badge from "@/components/ui/badge";
import * as Button from "@/components/ui/button";
import * as Input from "@/components/ui/input";

export default function Home() {
  return (
    <div className="min-h-screen font-sans">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-16">
        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Button Alignment Test
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button.Root variant="primary" mode="filled" size="medium">
                Primary Filled
              </Button.Root>
              <Button.Root variant="primary" mode="filled" size="medium">
                <Button.Icon>
                  <RiCheckLine />
                </Button.Icon>
                With Icon
              </Button.Root>
              <Button.Root variant="neutral" mode="stroke" size="medium">
                Neutral Stroke
              </Button.Root>
              <Button.Root variant="error" mode="filled" size="small">
                Error Small
              </Button.Root>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Badge Alignment Test
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <Badge.Root size="medium" variant="filled" color="gray">
                Badge Filled
              </Badge.Root>
              <Badge.Root size="medium" variant="light" color="blue">
                <Badge.Icon as={RiCheckLine} />
                With Icon
              </Badge.Root>
              <Badge.Root size="small" variant="stroke" color="green">
                Small Stroke
              </Badge.Root>
              <Badge.Root size="medium" variant="lighter" color="purple">
                <Badge.Dot />
                With Dot
              </Badge.Root>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Input Alignment Test
            </h2>
            <div className="flex flex-col gap-4 max-w-md">
              <Input.Root>
                <Input.Wrapper>
                  <Input.Icon>
                    <RiSearchLine />
                  </Input.Icon>
                  <Input.Input placeholder="Search input with icon" />
                </Input.Wrapper>
              </Input.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input placeholder="Standard input" />
                </Input.Wrapper>
              </Input.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input placeholder="Input with suffix" />
                  <Input.Affix>
                    <RiCloseLine />
                  </Input.Affix>
                </Input.Wrapper>
              </Input.Root>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Mixed Components Alignment
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button.Root variant="primary" mode="filled" size="medium">
                Button
              </Button.Root>
              <Badge.Root size="medium" variant="filled" color="blue">
                Badge
              </Badge.Root>
              <Input.Root className="w-48">
                <Input.Wrapper>
                  <Input.Input placeholder="Inline input" />
                </Input.Wrapper>
              </Input.Root>
              <Button.Root variant="neutral" mode="ghost" size="medium">
                <Button.Icon as={RiCheckLine} />
                Icon Button
              </Button.Root>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
