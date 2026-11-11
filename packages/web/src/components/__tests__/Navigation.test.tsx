import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navigation from "@/components/Navigation";
import NavLink from "@/components/ui/NavLink";

const navState = vi.hoisted(() => ({ pathname: "/dashboard" }));
const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => navState.pathname,
  useRouter: () => routerMock,
}));

const linkProbe = vi.hoisted(() => ({
  onNavigate: null as null | (() => void),
}));

type NextLinkProps = React.ComponentProps<(typeof import("next/link"))["default"]>;

const NON_DOM_LINK_PROPS = new Set([
  "href",
  "onClick",
  "onNavigate",
  "children",
  "transitionTypes",
  "prefetch",
  "replace",
  "scroll",
  "shallow",
  "passHref",
  "legacyBehavior",
  "locale",
]);

vi.mock("next/link", () => ({
  __esModule: true,
  default: (props: NextLinkProps) => {
    const { href, onClick, onNavigate, children } = props;
    const domProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      if (!NON_DOM_LINK_PROPS.has(key)) {
        domProps[key] = value;
      }
    }
    return (
      <a
        href={typeof href === "string" ? href : href?.pathname ?? "#"}
        {...domProps}
        onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          const destination = new URL(
            typeof href === "string" ? href : href?.pathname ?? "#",
            window.location.href,
          );
          const ordinaryNavigation =
            !event.defaultPrevented &&
            event.button === 0 &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey &&
            (domProps.target === undefined || domProps.target === "_self") &&
            domProps.download === undefined &&
            destination.origin === window.location.origin;
          if (ordinaryNavigation) {
            const navigateEvent = { preventDefault: vi.fn() };
            onNavigate?.(navigateEvent);
            if (navigateEvent.preventDefault.mock.calls.length === 0) {
              linkProbe.onNavigate?.();
            }
          }
          event.preventDefault();
        }}
      >
        {children}
      </a>
    );
  },
}));

const sessionState = vi.hoisted(() => ({
  loggedIn: {
    data: { user: { id: "user-1", name: "Josh Climber", email: "josh@example.com", isAdmin: true } },
    isPending: false,
  } as { data: unknown; isPending: boolean },
  current: null as unknown as { data: unknown; isPending: boolean },
}));
sessionState.current = sessionState.loggedIn;

vi.mock("@/lib/auth", () => ({
  useSession: () => sessionState.current,
}));
vi.mock("next/dynamic", () => ({ default: () => () => <span>GripKicks</span> }));
vi.mock("@/components/signout-button", () => ({
  SignOutButton: ({ children }: { children?: React.ReactNode }) => <button type="button">{children ?? "Sign out"}</button>,
}));

beforeEach(() => {
  sessionState.current = sessionState.loggedIn;
  navState.pathname = "/dashboard";
  linkProbe.onNavigate = null;
  routerMock.push.mockClear();
  routerMock.replace.mockClear();
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addListener: vi.fn(), removeListener: vi.fn() });
});

describe("Navigation", () => {
  it("renders the glassy transparent nav bar", () => {
    render(<Navigation />);
    const nav = document.querySelector("nav");
    expect(nav).not.toBeNull();
    expect(nav).toHaveClass("bg-brand-base/55", "backdrop-blur-xl", "backdrop-saturate-150", "h-12");
  });

  it("opens the menu with the profile row clear of the close control", () => {
    const { container } = render(<Navigation />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger.parentElement).toHaveClass("translate-y-[0.5px]");
    fireEvent.click(trigger);
    const closeTrigger = screen.getByRole("button", { name: "Close menu" });
    expect(closeTrigger).toHaveAttribute("aria-expanded", "true");
    const menu = container.querySelector(".nav-menu");
    expect(menu).not.toBeNull();
    const profile = within(menu as HTMLElement).getByRole("link", { name: /Profile/ });
    expect(profile).toBeInTheDocument();
    for (const label of ["Dashboard", "Foot Lab", "Sanctuary", "Matcher"]) {
      expect(within(menu as HTMLElement).getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(within(menu as HTMLElement).getByText("Sign out")).toBeInTheDocument();
  });

  it("renders neither Sign In nor the menu while the session is pending", () => {
    sessionState.current = { data: null, isPending: true };
    render(<Navigation />);
    expect(screen.queryByRole("link", { name: "Sign In" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Open menu" })).toBeNull();
  });

  it("shows Sign In once the session resolves to logged out", () => {
    sessionState.current = { data: null, isPending: false };
    render(<Navigation />);
    expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open menu" })).toBeNull();
  });

  it("shows the menu button once the session resolves to logged in", () => {
    render(<Navigation />);
    expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Sign In" })).toBeNull();
  });
});

describe("menu navigation", () => {
  const openMenu = () => {
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(document.querySelector(".nav-menu")).not.toBeNull();
  };

  const captureMenuStateOnNavigate = () => {
    const calls: { menuPresent: boolean; ariaExpanded: string | null }[] = [];
    linkProbe.onNavigate = () => {
      calls.push({
        menuPresent: document.querySelector(".nav-menu") !== null,
        ariaExpanded:
          document.querySelector("button[aria-expanded]")?.getAttribute("aria-expanded") ?? null,
      });
    };
    return calls;
  };

  const expectMenuClosing = () => {
    expect(document.querySelector(".nav-menu")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
    expect(routerMock.push).not.toHaveBeenCalled();
    expect(routerMock.replace).not.toHaveBeenCalled();
  };

  const expectMenuGone = async () => {
    await waitFor(() => expect(document.querySelector(".nav-menu")).toBeNull(), { timeout: 2000 });
  };

  it.each([
    { section: "main link", name: "Dashboard", href: "/dashboard" },
    { section: "main link", name: "Foot Lab", href: "/footlab" },
    { section: "main link", name: "Sanctuary", href: "/stash" },
    { section: "main link", name: "Matcher", href: "/matcher" },
    { section: "secondary link", name: "About", href: "/about" },
    { section: "secondary link", name: "Privacy", href: "/privacy" },
    { section: "admin link", name: "Admin", href: "/admin" },
    { section: "profile link", name: /Profile/, href: "/profile" },
  ])("animates the menu closed before routing for $section to $href", async ({ name, href }) => {
    render(<Navigation />);
    openMenu();
    const calls = captureMenuStateOnNavigate();
    fireEvent.click(screen.getByRole("link", { name }));
    expect(calls).toHaveLength(0);
    expectMenuClosing();
    await expectMenuGone();
    expect(routerMock.push).toHaveBeenCalledTimes(1);
    expect(routerMock.push).toHaveBeenCalledWith(href, { scroll: true, transitionTypes: ["page-nav"] });
  });

  it("animates the menu closed before the logo navigates home", async () => {
    render(<Navigation />);
    openMenu();
    const calls = captureMenuStateOnNavigate();
    fireEvent.click(screen.getByRole("link", { name: "GripKicks" }));
    expect(calls).toHaveLength(0);
    expectMenuClosing();
    await expectMenuGone();
    expect(routerMock.push).toHaveBeenCalledTimes(1);
    expect(routerMock.push).toHaveBeenCalledWith("/", { scroll: true, transitionTypes: ["page-nav"] });
  });

  it.each([
    { link: "Dashboard", modifier: "ctrl", init: { ctrlKey: true } },
    { link: "Dashboard", modifier: "meta", init: { metaKey: true } },
    { link: "Dashboard", modifier: "shift", init: { shiftKey: true } },
    { link: "Dashboard", modifier: "alt", init: { altKey: true } },
    { link: /Profile/, modifier: "ctrl", init: { ctrlKey: true } },
    { link: /Profile/, modifier: "meta", init: { metaKey: true } },
    { link: /Profile/, modifier: "shift", init: { shiftKey: true } },
    { link: /Profile/, modifier: "alt", init: { altKey: true } },
  ])("keeps the menu open for $modifier-click navigation from $link", ({ link, init }) => {
    render(<Navigation />);
    openMenu();
    const calls = captureMenuStateOnNavigate();
    fireEvent.click(screen.getByRole("link", { name: link }), init);
    expect(calls).toHaveLength(0);
    expect(document.querySelector(".nav-menu")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it.each([
    { label: "target blank", props: { target: "_blank" } },
    { label: "download", props: { download: "file.pdf" } },
  ])("keeps the menu open for $label links", ({ props }) => {
    render(
      <>
        <Navigation />
        <NavLink href="/privacy" {...props}>
          Footer Privacy
        </NavLink>
      </>,
    );
    openMenu();
    const calls = captureMenuStateOnNavigate();
    fireEvent.click(screen.getByRole("link", { name: "Footer Privacy" }));
    expect(calls).toHaveLength(0);
    expect(document.querySelector(".nav-menu")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("closes and reopens with the menu button", () => {
    render(<Navigation />);
    openMenu();
    fireEvent.click(screen.getByRole("button", { name: "Close menu" }));
    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(document.querySelector(".nav-menu")).not.toBeNull();
  });

  it("closes the menu when the pathname changes", () => {
    const { rerender } = render(<Navigation />);
    openMenu();
    navState.pathname = "/about";
    rerender(<Navigation />);
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("finishes the outside-close animation before routing to a link outside the menu", async () => {
    render(
      <>
        <Navigation />
        <NavLink href="/privacy">Footer Privacy</NavLink>
      </>,
    );
    openMenu();
    const calls = captureMenuStateOnNavigate();
    const outside = screen.getByRole("link", { name: "Footer Privacy" });
    fireEvent.mouseDown(outside);
    expect(document.querySelector(".nav-menu")).not.toBeNull();
    fireEvent.click(outside);
    expect(calls).toHaveLength(0);
    expectMenuClosing();
    await expectMenuGone();
    expect(routerMock.push).toHaveBeenCalledTimes(1);
    expect(routerMock.push).toHaveBeenCalledWith("/privacy", { scroll: true, transitionTypes: ["page-nav"] });
  });

  it("keeps the menu when a link's onNavigate cancels navigation", () => {
    render(
      <>
        <Navigation />
        <NavLink href="/privacy" onNavigate={(event) => event.preventDefault()}>
          Footer Privacy
        </NavLink>
      </>,
    );
    openMenu();
    const calls = captureMenuStateOnNavigate();
    fireEvent.click(screen.getByRole("link", { name: "Footer Privacy" }));
    expect(calls).toHaveLength(0);
    expect(document.querySelector(".nav-menu")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("keeps the menu open for external link navigation", () => {
    render(
      <>
        <Navigation />
        <NavLink href="https://example.com/privacy">External Privacy</NavLink>
      </>,
    );
    openMenu();
    const calls = captureMenuStateOnNavigate();
    fireEvent.click(screen.getByRole("link", { name: "External Privacy" }));
    expect(calls).toHaveLength(0);
    expect(document.querySelector(".nav-menu")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("lets closed-menu navigation fall through natively", () => {
    render(
      <>
        <Navigation />
        <NavLink href="/privacy">Footer Privacy</NavLink>
      </>,
    );
    const calls = captureMenuStateOnNavigate();
    fireEvent.click(screen.getByRole("link", { name: "Footer Privacy" }));
    expect(calls).toHaveLength(1);
    expect(routerMock.push).not.toHaveBeenCalled();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("routes only the latest target when links are clicked rapidly", async () => {
    render(<Navigation />);
    openMenu();
    const calls = captureMenuStateOnNavigate();
    fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));
    fireEvent.click(screen.getByRole("link", { name: "Privacy" }));
    expect(calls).toHaveLength(0);
    await expectMenuGone();
    expect(routerMock.push).toHaveBeenCalledTimes(1);
    expect(routerMock.push).toHaveBeenCalledWith("/privacy", { scroll: true, transitionTypes: ["page-nav"] });
  });

  it("honors replace, scroll and transitionTypes on navigation", async () => {
    render(
      <>
        <Navigation />
        <NavLink href="/matcher" replace scroll={false} transitionTypes={["fast-nav"]}>
          Custom Nav
        </NavLink>
      </>,
    );
    openMenu();
    const calls = captureMenuStateOnNavigate();
    fireEvent.click(screen.getByRole("link", { name: "Custom Nav" }));
    expect(calls).toHaveLength(0);
    await expectMenuGone();
    expect(routerMock.replace).toHaveBeenCalledTimes(1);
    expect(routerMock.replace).toHaveBeenCalledWith("/matcher", { scroll: false, transitionTypes: ["fast-nav"] });
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("invokes link onClick and onNavigate exactly once", async () => {
    const onClick = vi.fn();
    const onNavigate = vi.fn();
    render(
      <>
        <Navigation />
        <NavLink href="/privacy" onClick={onClick} onNavigate={onNavigate}>
          Footer Privacy
        </NavLink>
      </>,
    );
    openMenu();
    fireEvent.click(screen.getByRole("link", { name: "Footer Privacy" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledTimes(1);
    await expectMenuGone();
    expect(routerMock.push).toHaveBeenCalledTimes(1);
  });

  it("ignores menu toggles while a navigation close is pending", async () => {
    render(<Navigation />);
    openMenu();
    fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    await expectMenuGone();
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("discards pending navigation when the session is lost before the close completes", async () => {
    const { rerender } = render(<Navigation />);
    openMenu();
    fireEvent.click(screen.getByRole("link", { name: "Privacy" }));
    expectMenuClosing();
    sessionState.current = { data: null, isPending: false };
    rerender(<Navigation />);
    await waitFor(() => expect(document.querySelector(".nav-menu")).toBeNull(), { timeout: 2000 });
    await waitFor(() => expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument(), { timeout: 2000 });
    expect(routerMock.push).not.toHaveBeenCalled();
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("discards pending navigation when the URL changes before the close completes", async () => {
    render(<Navigation />);
    openMenu();
    fireEvent.click(screen.getByRole("link", { name: "Privacy" }));
    expectMenuClosing();
    window.history.pushState({}, "", "/elsewhere");
    await expectMenuGone();
    expect(routerMock.push).not.toHaveBeenCalled();
    expect(routerMock.replace).not.toHaveBeenCalled();
    window.history.pushState({}, "", "/dashboard");
  });

  it("hands off the route once the menu is 75% closed", async () => {
    render(<Navigation />);
    openMenu();
    const menu = document.querySelector(".nav-menu") as HTMLElement;
    await waitFor(() => expect(Number.parseFloat(menu.style.width)).toBeGreaterThan(350), { timeout: 2000 });
    const rect = menu.getBoundingClientRect();
    menu.getBoundingClientRect = () => ({
      ...rect,
      width: Number.parseFloat(menu.style.width) || 0,
      toJSON: () => ({}),
    });
    const startWidth = Number.parseFloat(menu.style.width);
    const handoffWidth = 72 + Math.max(0, startWidth - 72) * 0.25;
    let mountedAtRoute = false;
    let paintedWidth = 0;
    routerMock.push.mockImplementation(() => {
      const el = document.querySelector(".nav-menu") as HTMLElement | null;
      mountedAtRoute = el !== null;
      requestAnimationFrame(() => {
        const rendered = document.querySelector(".nav-menu") as HTMLElement | null;
        paintedWidth = rendered ? Number.parseFloat(rendered.style.width) || 0 : 0;
      });
    });
    fireEvent.click(screen.getByRole("link", { name: "Privacy" }));
    await waitFor(() => expect(routerMock.push).toHaveBeenCalledTimes(1), { timeout: 2000 });
    await waitFor(() => expect(paintedWidth).toBeGreaterThan(0), { timeout: 2000 });
    expect(mountedAtRoute).toBe(true);
    expect(paintedWidth).toBeGreaterThanOrEqual(70);
    expect(paintedWidth).toBeLessThanOrEqual(handoffWidth + 2);
    await expectMenuGone();
    expect(routerMock.push).toHaveBeenCalledTimes(1);
  });

  it("lets the menu reopen after navigation completes", async () => {
    render(<Navigation />);
    openMenu();
    fireEvent.click(screen.getByRole("link", { name: "Dashboard" }));
    await expectMenuGone();
    expect(routerMock.push).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(document.querySelector(".nav-menu")).not.toBeNull();
  });
});
