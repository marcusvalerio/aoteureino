import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/AppShell";
import Template from "@/app/template";
import NotFound from "@/app/not-found";
import { Home } from "@/components/home/Home";
import { Reader } from "@/components/devotional/Reader";
import { Palavra } from "@/components/pages/Palavra";
import { Jornada } from "@/components/pages/Jornada";
import { Salvos } from "@/components/pages/Salvos";
import { Mais } from "@/components/pages/Mais";
import { usePathname } from "./shims";

function Route() {
  const path = usePathname();
  const dia = path.match(/^\/dia\/(\d+)$/);
  let page;
  if (path === "/") page = <Home />;
  else if (dia && Number(dia[1]) >= 1 && Number(dia[1]) <= 31) page = <Reader day={Number(dia[1])} />;
  else if (path === "/palavra") page = <Palavra />;
  else if (path === "/jornada") page = <Jornada />;
  else if (path === "/salvos") page = <Salvos />;
  else if (path === "/mais") page = <Mais />;
  else page = <NotFound />;
  return <Template key={path}>{page}</Template>;
}

createRoot(document.getElementById("app")!).render(
  <AppShell>
    <Route />
  </AppShell>,
);
