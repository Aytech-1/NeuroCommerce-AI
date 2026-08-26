import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CustomerAddressesPage from "@/app/(portal)/account/addresses/page";
import {
  useCustomerAddresses,
  useCreateCustomerAddress,
  useDeleteCustomerAddress,
  useSetDefaultAddress,
} from "@/hooks/use-customer";
import { CustomerAddress } from "@/services/customer-service";

vi.mock("@/hooks/use-customer", () => ({
  useCustomerAddresses: vi.fn(),
  useCreateCustomerAddress: vi.fn(),
  useDeleteCustomerAddress: vi.fn(),
  useSetDefaultAddress: vi.fn(),
}));

const mockAddress1: CustomerAddress = {
  id: "addr-1",
  first_name: "Sarah",
  last_name: "Connor",
  company: "Cyberdyne Labs",
  address_line_1: "18144 El Camino Real",
  address_line_2: "Building 4, Bay 12",
  city: "Sunnyvale",
  state: "CA",
  postal_code: "94086",
  country_code: "US",
  phone: "+1 (555) 019-2834",
  is_default: true,
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

const mockAddress2: CustomerAddress = {
  id: "addr-2",
  first_name: "Sarah",
  last_name: "Connor",
  company: "MIT Neural Lab",
  address_line_1: "77 Massachusetts Ave",
  address_line_2: null,
  city: "Cambridge",
  state: "MA",
  postal_code: "02139",
  country_code: "US",
  phone: null,
  is_default: false,
  created_at: "2026-08-20T00:00:00Z",
  updated_at: "2026-08-20T00:00:00Z",
};

describe("Customer Addresses & Delivery Management Suite (STEP 26.11)", () => {
  const mockCreateAddress = vi.fn();
  const mockDeleteAddress = vi.fn();
  const mockSetDefault = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCustomerAddresses).mockReturnValue({
      data: [mockAddress1, mockAddress2],
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    vi.mocked(useCreateCustomerAddress).mockReturnValue({
      mutate: mockCreateAddress,
      isPending: false,
    } as any);

    vi.mocked(useDeleteCustomerAddress).mockReturnValue({
      mutate: mockDeleteAddress,
      isPending: false,
    } as any);

    vi.mocked(useSetDefaultAddress).mockReturnValue({
      mutate: mockSetDefault,
      isPending: false,
    } as any);
  });

  it("1. Header & Count: renders title, eyebrow, and authoritative address count", () => {
    render(<CustomerAddressesPage />);

    expect(screen.getByText("DELIVERY MANAGEMENT")).toBeInTheDocument();
    expect(screen.getByText("Saved Addresses")).toBeInTheDocument();
    expect(screen.getByText("2 saved addresses")).toBeInTheDocument();
  });

  it("2. Address Cards: renders recipient names, company, address lines, and default badge", () => {
    render(<CustomerAddressesPage />);

    expect(screen.getByText("Cyberdyne Labs")).toBeInTheDocument();
    expect(screen.getByText("18144 El Camino Real")).toBeInTheDocument();
    expect(screen.getByText("MIT Neural Lab")).toBeInTheDocument();
    expect(screen.getByText("77 Massachusetts Ave")).toBeInTheDocument();
    expect(screen.getByText("Default Address")).toBeInTheDocument();
  });

  it("3. Set Default Address: triggers set default mutation for secondary address", () => {
    render(<CustomerAddressesPage />);

    const setDefaultBtn = screen.getByRole("button", { name: /set as default/i });
    fireEvent.click(setDefaultBtn);

    expect(mockSetDefault).toHaveBeenCalledWith("addr-2");
  });

  it("4. Add Address Dialog: opens modal and submits new address payload", async () => {
    render(<CustomerAddressesPage />);

    const addBtn = screen.getByRole("button", { name: /add new address/i });
    fireEvent.click(addBtn);

    expect(screen.getByText("Add Delivery Address")).toBeInTheDocument();

    const firstNameInput = screen.getByLabelText(/first name \*/i);
    const lastNameInput = screen.getByLabelText(/last name \*/i);
    const streetInput = screen.getByLabelText(/street address \*/i);
    const cityInput = screen.getByLabelText(/city \*/i);
    const postalCodeInput = screen.getByLabelText(/postal code \*/i);

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.change(streetInput, { target: { value: "500 Howard St" } });
    fireEvent.change(cityInput, { target: { value: "San Francisco" } });
    fireEvent.change(postalCodeInput, { target: { value: "94105" } });

    const saveBtn = screen.getByRole("button", { name: /save address/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockCreateAddress).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: "John",
          last_name: "Doe",
          address_line_1: "500 Howard St",
          city: "San Francisco",
          postal_code: "94105",
        }),
        expect.anything()
      );
    });
  });

  it("5. Delete Address Flow: opens confirmation and triggers delete mutation", () => {
    render(<CustomerAddressesPage />);

    const deleteBtns = screen.getAllByRole("button", { name: /delete address/i });
    expect(deleteBtns.length).toBe(2);

    fireEvent.click(deleteBtns[1]);
    expect(screen.getByText("Delete this address?")).toBeInTheDocument();

    const confirmDeleteBtn = screen.getByRole("button", { name: /^delete address$/i });
    fireEvent.click(confirmDeleteBtn);

    expect(mockDeleteAddress).toHaveBeenCalledWith("addr-2", expect.anything());
  });

  it("6. Empty State: renders fallback when no addresses saved", () => {
    vi.mocked(useCustomerAddresses).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<CustomerAddressesPage />);

    expect(screen.getByText("No Saved Addresses")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add your first address/i })).toBeInTheDocument();
  });
});
