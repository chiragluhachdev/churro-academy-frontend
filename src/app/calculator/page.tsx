import { redirect } from "next/navigation";

/** The calculator now lives inside Churro AI, behind sign-in and the free try. */
export default function CalculatorPage() {
  redirect("/churroai/calculator");
}
