"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Building,
  AlertCircle,
  Check,
  Cpu,
  RotateCcw,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { useCustomerProfile, useCustomerAddresses } from "@/hooks/use-customer";
import { useShippingRates, useTaxCalculation, useProcessCheckout } from "@/hooks/use-checkout";
import { useAuthStore } from "@/stores/auth-store";
import { AddressPayload, ProcessCheckoutPayload } from "@/services/checkout-service";

export default function CheckoutPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const { user, isAuthenticated } = useAuthStore();
  const { data: profile } = useCustomerProfile();
  const { data: addresses } = useCustomerAddresses();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: shippingRates, isLoading: ratesLoading } = useShippingRates();
  const { data: taxData } = useTaxCalculation("US");
  const processCheckoutMutation = useProcessCheckout();

  // Guest / Customer Contact Info
  const [guestEmail, setGuestEmail] = useState("");
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Shipping Address
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [shippingAddress, setShippingAddress] = useState<AddressPayload>({
    first_name: "",
    last_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country_code: "US",
    phone: "",
  });

  // Billing Address
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState<AddressPayload>({
    first_name: "",
    last_name: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country_code: "US",
    phone: "",
  });

  // Shipping & Payment Method
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("Standard Ground Delivery");
  const [selectedShippingCost, setSelectedShippingCost] = useState(0.0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"stripe" | "paypal" | "cash_on_delivery">("stripe");
  const [orderNotes, setOrderNotes] = useState("");

  // Card Simulator Details (for Stripe)
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("•••");

  // Autofill user info if authenticated
  useEffect(() => {
    if (isAuthenticated && profile) {
      setGuestEmail(profile.email || "");
      setGuestFirstName(profile.first_name || "");
      setGuestLastName(profile.last_name || "");
      setGuestPhone(profile.phone || "");

      if (!shippingAddress.first_name) {
        setShippingAddress((prev) => ({
          ...prev,
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone: profile.phone || "",
        }));
      }
    }
  }, [isAuthenticated, profile]);

  // Set default address if available
  useEffect(() => {
    if (addresses && addresses.length > 0 && selectedAddressId === "new") {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setShippingAddress({
          first_name: defaultAddr.first_name,
          last_name: defaultAddr.last_name,
          address_line_1: defaultAddr.address_line_1,
          address_line_2: defaultAddr.address_line_2 || "",
          city: defaultAddr.city,
          state_province: defaultAddr.state || "",
          postal_code: defaultAddr.postal_code,
          country_code: defaultAddr.country_code || "US",
          phone: defaultAddr.phone || "",
        });
      }
    }
  }, [addresses]);

  const handleSavedAddressSelect = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId === "new") {
      setShippingAddress({
        first_name: guestFirstName || "",
        last_name: guestLastName || "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state_province: "",
        postal_code: "",
        country_code: "US",
        phone: guestPhone || "",
      });
    } else {
      const addr = addresses?.find((a) => a.id === addrId);
      if (addr) {
        setShippingAddress({
          first_name: addr.first_name,
          last_name: addr.last_name,
          address_line_1: addr.address_line_1,
          address_line_2: addr.address_line_2 || "",
          city: addr.city,
          state_province: addr.state || "",
          postal_code: addr.postal_code,
          country_code: addr.country_code || "US",
          phone: addr.phone || "",
        });
      }
    }
  };

  const handlePlaceOrder = () => {
    const activeBilling = sameAsShipping ? shippingAddress : billingAddress;

    const payload: ProcessCheckoutPayload = {
      shipping_address: shippingAddress,
      billing_address: activeBilling,
      shipping_method: selectedShippingMethod,
      payment_method: selectedPaymentMethod,
      payment_token: selectedPaymentMethod === "stripe" ? "tok_visa_deterministic" : "paypal_order_token",
      notes: orderNotes.trim() || undefined,
      coupon_code: cart?.coupon_code || undefined,
      guest_email: !isAuthenticated ? guestEmail : undefined,
      guest_first_name: !isAuthenticated ? guestFirstName : undefined,
      guest_last_name: !isAuthenticated ? guestLastName : undefined,
      guest_phone: !isAuthenticated ? guestPhone : undefined,
    };

    processCheckoutMutation.mutate(payload);
  };

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  if (cartLoading) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-8 sm:py-12">
        <Container className="space-y-8">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            <Skeleton className="h-96 rounded-[20px] lg:col-span-7" />
            <Skeleton className="h-80 rounded-[20px] lg:col-span-5" />
          </div>
        </Container>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-[#F8FAFC] min-h-screen py-12 sm:py-16">
        <Container>
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-12 text-center shadow-2xs">
            <EmptyState
              icon={ShoppingBag}
              title="Your Shopping Bag is Empty"
              description="Add neural interface telemetry hardware or EEG headsets to your cart before proceeding to checkout."
              actionLabel="Explore Hardware Catalog"
              onAction={() => {
                window.location.href = "/products";
              }}
            />
          </div>
        </Container>
      </div>
    );
  }

  const subtotal = cart?.subtotal ?? 0;
  const discountTotal = cart?.discount_total ?? 0;
  const taxTotal = taxData?.tax_amount ?? 0;
  const grandTotal = Math.max(0, subtotal - discountTotal + selectedShippingCost + taxTotal);

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 sm:py-12">
      <Container className="space-y-8">
        {/* ======================================================================= */}
        {/* 1. BREADCRUMB NAVIGATION                                                */}
        {/* ======================================================================= */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500"
        >
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <Link href="/cart" className="hover:text-blue-600 transition-colors">
            Shopping Bag
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
          <span aria-current="page" className="text-slate-900 font-bold">
            Checkout
          </span>
        </nav>

        {/* ======================================================================= */}
        {/* 2. EXECUTIVE CHECKOUT HEADER & PROGRESS STEPPER                         */}
        {/* ======================================================================= */}
        <section className="relative overflow-hidden rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>SECURE CHECKOUT</span>
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Checkout &amp; Hardware Acquisition
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Complete your delivery and payment details to place your order.
              </p>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[
                { num: 1, label: "Contact" },
                { num: 2, label: "Delivery" },
                { num: 3, label: "Shipping" },
                { num: 4, label: "Payment" },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num as any)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    step === s.num
                      ? "bg-blue-600 text-white shadow-xs"
                      : step > s.num
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                      : "bg-slate-50 text-slate-500 border border-slate-200"
                  }`}
                >
                  {step > s.num ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <span>{s.num}</span>
                  )}
                  <span className="hidden md:inline">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 3. MAIN CHECKOUT WORKSPACE (7 COLS FORM / 5 COLS SUMMARY)                */}
        {/* ======================================================================= */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* ------------------------------------------------------------------- */}
          {/* LEFT: STEP FORMS (7 cols on desktop)                                */}
          {/* ------------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: Customer Contact Information */}
            {step === 1 && (
              <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                      1. Researcher Contact Information
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Order dispatch updates and hardware serial registration will be sent here.
                    </p>
                  </div>
                  {!isAuthenticated && (
                    <Link
                      href="/login?redirect=/checkout"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Log In →
                    </Link>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        First Name *
                      </label>
                      <Input
                        value={guestFirstName}
                        onChange={(e) => setGuestFirstName(e.target.value)}
                        placeholder="Sarah"
                        className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Last Name *
                      </label>
                      <Input
                        value={guestLastName}
                        onChange={(e) => setGuestLastName(e.target.value)}
                        placeholder="Connor"
                        className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="sarah.connor@cyberdyne.lab"
                      className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Phone Number (Optional)
                    </label>
                    <Input
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+1 (617) 253-1000"
                      className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </div>

                  <div className="pt-4 flex justify-end border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!guestEmail.trim() || !guestFirstName.trim() || !guestLastName.trim()}
                      className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      <span>Continue to Delivery Address</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Shipping & Delivery Address */}
            {step === 2 && (
              <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    2. Laboratory Shipping Destination
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Specify delivery dock, hospital facility, or academic lab address.
                  </p>
                </div>

                {/* Saved Address Selection for Authenticated Users */}
                {isAuthenticated && addresses && addresses.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-800 block">
                      Select Saved Laboratory Address:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          onClick={() => handleSavedAddressSelect(addr.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all text-xs ${
                            selectedAddressId === addr.id
                              ? "border-blue-600 bg-blue-50/50 shadow-2xs ring-1 ring-blue-500"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="font-bold text-slate-900 flex items-center justify-between">
                            <span>
                              {addr.first_name} {addr.last_name}
                            </span>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                Default
                              </span>
                            )}
                          </div>
                          {addr.company && <p className="text-slate-500 mt-0.5">{addr.company}</p>}
                          <p className="text-slate-600 mt-1">{addr.address_line_1}</p>
                          <p className="text-slate-600">
                            {addr.city}, {addr.state} {addr.postal_code}
                          </p>
                        </div>
                      ))}

                      <div
                        onClick={() => handleSavedAddressSelect("new")}
                        className={`p-4 rounded-xl border cursor-pointer transition-all text-xs flex items-center justify-center font-bold ${
                          selectedAddressId === "new"
                            ? "border-blue-600 bg-blue-50/50 text-blue-600"
                            : "border-dashed border-slate-300 text-slate-500 hover:border-slate-400"
                        }`}
                      >
                        + Enter Custom Address
                      </div>
                    </div>
                  </div>
                )}

                {/* Address Form Inputs */}
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Street Address Line 1 *
                    </label>
                    <Input
                      value={shippingAddress.address_line_1}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, address_line_1: e.target.value })
                      }
                      placeholder="77 Massachusetts Avenue, Building E25"
                      className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Address Line 2 / Lab Suite (Optional)
                    </label>
                    <Input
                      value={shippingAddress.address_line_2 || ""}
                      onChange={(e) =>
                        setShippingAddress({ ...shippingAddress, address_line_2: e.target.value })
                      }
                      placeholder="Room 402 - Neuro Engineering Wing"
                      className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        City *
                      </label>
                      <Input
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, city: e.target.value })
                        }
                        placeholder="Cambridge"
                        className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        State / Province
                      </label>
                      <Input
                        value={shippingAddress.state_province || ""}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, state_province: e.target.value })
                        }
                        placeholder="MA"
                        className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        Postal Code *
                      </label>
                      <Input
                        value={shippingAddress.postal_code}
                        onChange={(e) =>
                          setShippingAddress({ ...shippingAddress, postal_code: e.target.value })
                        }
                        placeholder="02139"
                        className="text-xs h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-11 px-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={
                        !shippingAddress.address_line_1.trim() ||
                        !shippingAddress.city.trim() ||
                        !shippingAddress.postal_code.trim()
                      }
                      className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      <span>Continue to Shipping Method</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Shipping Method Selection */}
            {step === 3 && (
              <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    3. Select Logistics &amp; Courier Method
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Temperature-controlled and calibrated delivery options for sensitive neural hardware.
                  </p>
                </div>

                <div className="space-y-3">
                  {ratesLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 rounded-xl" />
                      <Skeleton className="h-16 rounded-xl" />
                    </div>
                  ) : shippingRates && shippingRates.length > 0 ? (
                    shippingRates.map((rate) => (
                      <div
                        key={rate.id}
                        onClick={() => {
                          setSelectedShippingMethod(rate.name);
                          setSelectedShippingCost(rate.cost);
                        }}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedShippingMethod === rate.name
                            ? "border-blue-600 bg-blue-50/50 shadow-2xs ring-1 ring-blue-500"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                            <Truck className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rate.name}</h4>
                            <p className="text-xs text-slate-500">
                              Via {rate.carrier} • Estimated {rate.estimated_days}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {rate.cost === 0 ? "FREE" : formatCurrency(rate.cost)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div
                      onClick={() => {
                        setSelectedShippingMethod("Standard Ground Delivery");
                        setSelectedShippingCost(0);
                      }}
                      className="flex items-center justify-between p-4 rounded-xl border border-blue-600 bg-blue-50/50"
                    >
                      <div className="flex items-center gap-3.5">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Standard Ground Delivery</h4>
                          <p className="text-xs text-slate-500">USPS Laboratory Express • 3-5 business days</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">FREE</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="h-11 px-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Payment Method & Review */}
            {step === 4 && (
              <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    4. Secure Payment Method
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your preferred laboratory procurement billing method.
                  </p>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("stripe")}
                    className={`flex items-center gap-2.5 p-4 rounded-xl border text-xs font-bold transition-all ${
                      selectedPaymentMethod === "stripe"
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-2xs ring-1 ring-blue-500"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("paypal")}
                    className={`flex items-center gap-2.5 p-4 rounded-xl border text-xs font-bold transition-all ${
                      selectedPaymentMethod === "paypal"
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-2xs ring-1 ring-blue-500"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    <span>PayPal / Institutional</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod("cash_on_delivery")}
                    className={`flex items-center gap-2.5 p-4 rounded-xl border text-xs font-bold transition-all ${
                      selectedPaymentMethod === "cash_on_delivery"
                        ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-2xs ring-1 ring-blue-500"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>PO / Wire Invoice</span>
                  </button>
                </div>

                {/* Card Simulator Fields (Stripe) */}
                {selectedPaymentMethod === "stripe" && (
                  <div className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Stripe Secured Tokenization</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">PCI-DSS Level 1</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Card Number
                      </label>
                      <Input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="text-xs font-mono h-11 rounded-xl bg-white border-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Expiry Date
                        </label>
                        <Input
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="text-xs font-mono h-11 rounded-xl bg-white border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          Security CVC
                        </label>
                        <Input
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="text-xs font-mono h-11 rounded-xl bg-white border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Special Instructions */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Laboratory Delivery Notes / PO Reference (Optional)
                  </label>
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="E.g., Deliver to Cleanroom Loading Dock B between 9 AM and 4 PM..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="h-11 px-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>

                  {/* DUPLICATE SUBMISSION PROTECTED BUTTON */}
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={processCheckoutMutation.isPending}
                    className="h-13 px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-bold text-white shadow-lg hover:bg-blue-700 active:scale-98 disabled:opacity-50 transition-all"
                  >
                    <Lock className="h-4 w-4" />
                    <span>
                      {processCheckoutMutation.isPending
                        ? "Authorizing Order..."
                        : `Authorize & Place Order (${formatCurrency(grandTotal)})`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* RIGHT: AUTHORITATIVE STICKY ORDER SUMMARY (5 cols on desktop)       */}
          {/* ------------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
            <div className="rounded-[20px] border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900">
                  Order Review ({items.length} item{items.length > 1 ? "s" : ""})
                </h3>
                <Link
                  href="/cart"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  Edit Cart
                </Link>
              </div>

              {/* Line items thumbnail list */}
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 pr-2 space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.product?.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 shrink-0">
                      {formatCurrency(item.subtotal || item.unit_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Totals */}
              <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
                <div className="flex justify-between text-slate-600">
                  <span>Hardware Subtotal</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount ({cart?.coupon_code || "Voucher"})</span>
                    <span>-{formatCurrency(discountTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Shipping ({selectedShippingMethod})</span>
                  <span className="font-semibold text-slate-900">
                    {selectedShippingCost === 0 ? "FREE" : formatCurrency(selectedShippingCost)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(taxTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                  <span>Total Due</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {/* Trust & Certification Strip */}
              <div className="rounded-xl bg-[#F8FAFC] p-4 text-[11px] text-slate-600 border border-slate-100 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>ISO 13485 Certified Supply Chain</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Hardware telemetry devices undergo calibrated testing and ESD-safe inspection prior to dispatch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
