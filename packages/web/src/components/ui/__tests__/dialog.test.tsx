import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

describe("Dialog", () => {
  it("renders trigger button", () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("button", { name: /open dialog/i })).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: /open dialog/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Dialog Title")).toBeInTheDocument();
    expect(screen.getByText("Dialog Description")).toBeInTheDocument();
  });

  it("renders DialogHeader with correct structure", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader data-testid="header">
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    const header = screen.getByTestId("header");
    expect(header).toHaveClass("flex");
    expect(header).toHaveClass("flex-col");
  });

  it("renders DialogFooter with correct structure", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogFooter data-testid="footer">
            <Button>Cancel</Button>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );

    const footer = screen.getByTestId("footer");
    expect(footer).toHaveClass("flex");
  });

  it("DialogTitle has correct styling", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle data-testid="title">My Title</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const title = screen.getByTestId("title");
    expect(title).toHaveClass("text-lg");
    expect(title).toHaveClass("font-semibold");
  });

  it("DialogDescription has correct styling", () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogDescription data-testid="description">My Description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );

    const description = screen.getByTestId("description");
    expect(description).toHaveClass("text-sm");
    expect(description).toHaveClass("text-muted-foreground");
  });

  it("closes dialog when close button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose asChild>
            <Button>Close Dialog</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close dialog/i }));
  });

  it("DialogTitle has correct display name", () => {
    expect(DialogTitle.displayName).toBe("DialogTitle");
  });

  it("DialogDescription has correct display name", () => {
    expect(DialogDescription.displayName).toBe("DialogDescription");
  });

  it("DialogHeader has correct display name", () => {
    expect(DialogHeader.displayName).toBe("DialogHeader");
  });

  it("DialogFooter has correct display name", () => {
    expect(DialogFooter.displayName).toBe("DialogFooter");
  });
});
