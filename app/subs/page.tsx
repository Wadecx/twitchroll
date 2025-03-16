import { FetcherRandom } from "@/containers/random/random";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "",
  description: "",
};

export default function HomePage() {
  return (
    <>
      <FetcherRandom />
    </>
  );
}
