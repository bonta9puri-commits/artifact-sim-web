import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nicole Reeyn | Artifact Analysis System",
  description: "Nicole Reeyn 特選・聖遺物解析システム。目標スコアまでの日数や期待値をシミュレート。",
  openGraph: {
    title: "Nicole Reeyn | Artifact Analysis System",
    description: "Nicole Reeyn 専用の聖遺物厳選シミュレーター。あなたの厳選期待値を可視化。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nicole Reeyn | Artifact Analysis System",
    description: "Nicole Reeyn 専用の聖遺物厳選シミュレーター。あなたの厳選期待値を可視化。",
  }
};

export default function NicoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
