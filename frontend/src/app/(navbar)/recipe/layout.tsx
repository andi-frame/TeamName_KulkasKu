import { ReactNode } from "react";

export default function RecipePageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="px-2 pt-6 pb-32">{children}</main>
    </>
  );
}
