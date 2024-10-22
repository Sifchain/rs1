import { useEffect } from "react";
import { useRouter } from "next/router";
import withMetaMaskCheck from "../components/withMetaMaskCheck";

function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/backrooms");
  }, [router]);
}

export default withMetaMaskCheck(Home);
