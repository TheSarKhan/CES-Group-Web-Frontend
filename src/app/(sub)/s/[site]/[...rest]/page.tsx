import { notFound } from "next/navigation";

// Tanınmayan ünvanlar alt-saytın öz 404 səhifəsini göstərsin (qrupun yox)
export default function CatchAll() {
  notFound();
}
