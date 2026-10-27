declare global {
  interface Window {
    MonnifySDK: any;
  }
}

const payWithMonnify = (block: string, flat: string, amount: number) => {
  if (typeof window === "undefined" || !window.MonnifySDK) {
    alert("Payment gateway is initializing, please try again in a few seconds.");
    return;
  }

  window.MonnifySDK.initialize({
    amount: amount,
    currency: "NGN",
    reference: `UM_${block.replace(/\s+/g, "")}_${flat.replace(/\s+/g, "")}_${Date.now()}`,
    customerFullName: `Resident - ${block}, ${flat}`,
    customerEmail: `resident-${block.toLowerCase()}-${flat.toLowerCase()}@unitmate.ng`.replace(/\s+/g, ""),
    apiKey: "MK_TEST_XXXXXXXXXX", // Or process.env.NEXT_PUBLIC_MONNIFY_API_KEY
    contractCode: "4HT2DW13YC5P", // Your Monnify Contract Code
    paymentDescription: `UnitMate Monthly Estate Dues - ${block}, ${flat}`,
    isTestMode: false,
    onComplete: function (response: any) {
      if (response.paymentStatus === "PAID") {
        alert("Payment successful! Your dues clearance has been updated.");
        window.location.reload();
      }
    },
    onClose: function () {
      console.log("Monnify checkout closed");
    },
  });
};
