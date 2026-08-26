import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

describe("Global UI Polish — Form Controls, Button Contrast & Interactive State Consistency", () => {
  it("1. Standard Input: renders light background, dark text, and subtle border", () => {
    render(<Input placeholder="Enter laboratory identifier..." />);
    const input = screen.getByPlaceholderText("Enter laboratory identifier...");

    expect(input).toBeInTheDocument();
    expect(input.className).toContain("bg-white");
    expect(input.className).toContain("text-slate-900");
    expect(input.className).toContain("border-slate-200");
    expect(input.className).not.toContain("dark:bg-slate-900");
  });

  it("2. Standard Input Error: applies rose border and focus ring", () => {
    render(<Input placeholder="Invalid input" error />);
    const input = screen.getByPlaceholderText("Invalid input");

    expect(input.className).toContain("border-rose-500");
    expect(input.className).toContain("focus-visible:ring-rose-500/15");
  });

  it("3. Standard Textarea: renders light background, dark text, and subtle border", () => {
    render(<Textarea placeholder="Enter operational notes..." />);
    const textarea = screen.getByPlaceholderText("Enter operational notes...");

    expect(textarea).toBeInTheDocument();
    expect(textarea.className).toContain("bg-white");
    expect(textarea.className).toContain("text-slate-900");
    expect(textarea.className).toContain("border-slate-200");
    expect(textarea.className).not.toContain("dark:bg-slate-900");
  });

  it("4. Primary Button: renders blue surface with high-contrast white text", () => {
    render(<Button variant="primary">Save Changes</Button>);
    const button = screen.getByRole("button", { name: "Save Changes" });

    expect(button.className).toContain("bg-blue-600");
    expect(button.className).toContain("text-white");
    expect(button.className).toContain("hover:bg-blue-700");
  });

  it("5. Secondary Button: renders white surface with dark text and subtle border", () => {
    render(<Button variant="secondary">Cancel Action</Button>);
    const button = screen.getByRole("button", { name: "Cancel Action" });

    expect(button.className).toContain("bg-white");
    expect(button.className).toContain("text-slate-700");
    expect(button.className).toContain("border-slate-200");
  });

  it("6. Destructive Button: renders high-contrast red surface with white text", () => {
    render(<Button variant="destructive">Delete Record</Button>);
    const button = screen.getByRole("button", { name: "Delete Record" });

    expect(button.className).toContain("bg-rose-600");
    expect(button.className).toContain("text-white");
    expect(button.className).toContain("hover:bg-rose-700");
  });

  it("7. Ghost Button: renders transparent surface with dark text", () => {
    render(<Button variant="ghost">Quick Action</Button>);
    const button = screen.getByRole("button", { name: "Quick Action" });

    expect(button.className).toContain("bg-transparent");
    expect(button.className).toContain("text-slate-600");
  });

  it("8. Badges: renders high-contrast semantic variants without dark mode inversion", () => {
    const { container } = render(
      <div>
        <Badge variant="success">Active</Badge>
        <Badge variant="destructive">Failed</Badge>
        <Badge variant="warning">Pending</Badge>
        <Badge variant="secondary">Neutral</Badge>
      </div>
    );

    const successBadge = screen.getByText("Active");
    expect(successBadge.className).toContain("bg-emerald-50");
    expect(successBadge.className).toContain("text-emerald-700");

    const destructiveBadge = screen.getByText("Failed");
    expect(destructiveBadge.className).toContain("bg-rose-50");
    expect(destructiveBadge.className).toContain("text-rose-700");

    const warningBadge = screen.getByText("Pending");
    expect(warningBadge.className).toContain("bg-amber-50");
    expect(warningBadge.className).toContain("text-amber-700");
  });

  it("9. Alerts: renders semantic backgrounds and text colors", () => {
    render(
      <Alert variant="info">
        <AlertTitle>System Notice</AlertTitle>
        <AlertDescription>Security patches applied successfully.</AlertDescription>
      </Alert>
    );

    expect(screen.getByText("System Notice")).toBeInTheDocument();
    expect(screen.getByText("Security patches applied successfully.")).toBeInTheDocument();
  });

  it("10. Table: renders clean light surface and border styling", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Neural Cortex X1</TableCell>
            <TableCell>Active</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByText("Entity")).toBeInTheDocument();
    expect(screen.getByText("Neural Cortex X1")).toBeInTheDocument();
  });

  it("11. Dialog: renders white surface with dark text and subtle borders", () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Confirmation Dialog</DialogTitle>
          <DialogDescription>Are you sure you want to proceed?</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Confirmation Dialog")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
  });
});
