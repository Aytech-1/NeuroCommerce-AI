import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CustomerProfilePage from "@/app/(portal)/account/profile/page";
import CustomerWishlistPage from "@/app/(portal)/account/wishlist/page";
import CustomerAddressesPage from "@/app/(portal)/account/addresses/page";
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
  useChangePassword,
  useCustomerWishlist,
  useMoveWishlistToCart,
  useRemoveWishlistItem,
  useCustomerAddresses,
  useCreateCustomerAddress,
  useDeleteCustomerAddress,
  useSetDefaultAddress,
} from "@/hooks/use-customer";

vi.mock("@/hooks/use-customer", () => ({
  useCustomerProfile: vi.fn(),
  useUpdateCustomerProfile: vi.fn(),
  useChangePassword: vi.fn(),
  useCustomerWishlist: vi.fn(),
  useMoveWishlistToCart: vi.fn(),
  useRemoveWishlistItem: vi.fn(),
  useCustomerAddresses: vi.fn(),
  useCreateCustomerAddress: vi.fn(),
  useDeleteCustomerAddress: vi.fn(),
  useSetDefaultAddress: vi.fn(),
}));

describe("Customer Profile, Wishlist & Addresses Suite", () => {
  const mockMoveToCart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useCustomerProfile).mockReturnValue({
      data: { id: "u-1", first_name: "Sarah", last_name: "Connor", email: "sarah@cyberdyne.lab" },
      isLoading: false,
    } as any);

    vi.mocked(useUpdateCustomerProfile).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useChangePassword).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useMoveWishlistToCart).mockReturnValue({
      mutate: mockMoveToCart,
      isPending: false,
    } as any);

    vi.mocked(useRemoveWishlistItem).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useCreateCustomerAddress).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useDeleteCustomerAddress).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useSetDefaultAddress).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders profile editing form with preloaded customer details", () => {
    render(<CustomerProfilePage />);

    expect(screen.getByText("Profile & Credentials")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Sarah")).toBeInTheDocument();
    expect(screen.getByDisplayValue("sarah@cyberdyne.lab")).toBeInTheDocument();
  });

  it("renders wishlist items and triggers move to shopping bag", () => {
    vi.mocked(useCustomerWishlist).mockReturnValue({
      data: {
        items: [
          {
            id: "w-1",
            product_id: "prod-1",
            product: {
              id: "prod-1",
              name: "Neural Interface V2 Pro",
              base_price: 549.99,
              slug: "neural-interface-v2-pro",
            },
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as any);

    render(<CustomerWishlistPage />);

    expect(screen.getByText("Saved Wishlist")).toBeInTheDocument();
    expect(screen.getByText("Neural Interface V2 Pro")).toBeInTheDocument();

    const moveBtn = screen.getByRole("button", { name: /move to shopping bag/i });
    fireEvent.click(moveBtn);

    expect(mockMoveToCart).toHaveBeenCalledWith("prod-1");
  });

  it("renders address book with saved shipping locations", () => {
    vi.mocked(useCustomerAddresses).mockReturnValue({
      data: [
        {
          id: "addr-1",
          first_name: "Sarah",
          last_name: "Connor",
          company: "Cyberdyne Labs",
          address_line_1: "77 Massachusetts Ave",
          city: "Cambridge",
          state: "MA",
          postal_code: "02139",
          country_code: "US",
          is_default: true,
        },
      ],
      isLoading: false,
      isError: false,
    } as any);

    render(<CustomerAddressesPage />);

    expect(screen.getByText("Address Book")).toBeInTheDocument();
    expect(screen.getByText("Cyberdyne Labs")).toBeInTheDocument();
    expect(screen.getByText("Default Address")).toBeInTheDocument();
  });
});
