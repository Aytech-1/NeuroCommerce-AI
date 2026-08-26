import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";

describe("Foundation UI Components", () => {
  it("renders Alert with title and description", () => {
    render(
      <Alert variant="warning">
        <AlertTitle>Warning Title</AlertTitle>
        <AlertDescription>Warning description message</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Warning Title")).toBeInTheDocument();
    expect(screen.getByText("Warning description message")).toBeInTheDocument();
  });

  it("renders Card with title and content", () => {
    render(
      <Card>
        <CardTitle>Metric Card</CardTitle>
        <CardContent>Metric Value: $10,000</CardContent>
      </Card>
    );

    expect(screen.getByText("Metric Card")).toBeInTheDocument();
    expect(screen.getByText("Metric Value: $10,000")).toBeInTheDocument();
  });

  it("renders Pagination controls properly", () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={() => {}} />);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /previous page/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /next page/i })).not.toBeDisabled();
  });
});
