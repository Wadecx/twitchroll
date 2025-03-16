import { Fetcher } from "@/containers/home/fetch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default function HomePage() {
  return (
    <>
      <Fetcher />
    </>
  );
}
