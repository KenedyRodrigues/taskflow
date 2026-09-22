"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckCheck,
  LayoutGrid,
  ChartNoAxesCombined,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/frontend/lib/supabase";
export default function Shell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const [collapsed, setCollapsed] = useState(false),
    [mobile, setMobile] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const pathname = usePathname();
  const [narrow, setNarrow] = useState(false);
  const sidebar = useRef<HTMLElement>(null),
    menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width:640px)");
    const update = () => {
      setNarrow(media.matches);
      if (!media.matches) setMobile(false);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobile || !narrow) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const items = () =>
      Array.from(
        sidebar.current?.querySelectorAll<HTMLElement>(
          "a[href],button:not(:disabled)",
        ) ?? [],
      ).filter((item) => item.offsetParent !== null);
    items()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobile(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const list = items(),
          first = list[0],
          last = list[list.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
    };
  }, [mobile, narrow]);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("taskflow:sidebar") === "collapsed");
    } catch {}
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || (!session && event === "INITIAL_SESSION"))
        window.location.replace("/login");
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    setMobile(false);
  }, [pathname]);
  function toggle() {
    setCollapsed((value) => {
      try {
        localStorage.setItem(
          "taskflow:sidebar",
          value ? "expanded" : "collapsed",
        );
      } catch {}
      return !value;
    });
  }
  async function logout() {
    setBusy(true);
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      setError("Não foi possível sair. Tente novamente.");
      setBusy(false);
    } else window.location.replace("/login");
  }
  return (
    <div
      className={
        "shell" +
        (collapsed ? " is-collapsed" : "") +
        (mobile ? " mobile-open" : "")
      }
    >
      {mobile && (
        <button
          className="menu-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        ref={sidebar}
        id="workspace-navigation"
        className="sidebar"
        inert={narrow && !mobile}
      >
        <div className="sidebar-brand">
          <Link className="brand" href="/tasks" aria-label="TaskFlow">
            <span className="brand-icon">
              <CheckCheck size={23} />
            </span>
            <span className="nav-label">TaskFlow</span>
          </Link>
          <button
            className="icon-button mobile-close"
            aria-label="Fechar navegação"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        </div>
        <button
          className="collapse-button icon-button"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!collapsed}
          onClick={toggle}
        >
          {collapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
          <span className="nav-label">Recolher menu</span>
        </button>
        <nav aria-label="Navegação principal">
          {[
            { href: "/tasks", label: "Minhas tarefas", Icon: LayoutGrid },
            {
              href: "/statistics",
              label: "Estatísticas",
              Icon: ChartNoAxesCombined,
            },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={"nav-item" + (pathname === href ? " active" : "")}
              aria-current={pathname === href ? "page" : undefined}
              aria-label={label}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} />
              <span className="nav-label">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="profile">
          <div className="avatar nav-label">
            {email.slice(0, 1).toUpperCase()}
          </div>
          <div className="nav-label">
            <strong>Minha conta</strong>
            <span title={email}>{email}</span>
          </div>
          <button
            className="icon-button"
            aria-label="Sair da conta"
            title="Sair da conta"
            disabled={busy}
            onClick={logout}
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>
      <div className="main-wrap" inert={narrow && mobile}>
        <header className="topbar">
          <button
            ref={menuButton}
            className="icon-button mobile-menu"
            aria-controls="workspace-navigation"
            aria-label="Abrir menu"
            aria-expanded={mobile}
            onClick={() => setMobile(true)}
          >
            <Menu size={21} />
          </button>
          <div>
            <span className="breadcrumb">Meu espaço</span>
            <span className="slash">/</span>
            {pathname === "/statistics" ? "Estatísticas" : "Minhas tarefas"}
          </div>
          <span className="personal">
            <i />
            Espaço pessoal
          </span>
        </header>
        <main>
          {error && (
            <p role="alert" className="message error">
              {error}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
