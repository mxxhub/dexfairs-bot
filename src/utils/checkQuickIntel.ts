import axios from "axios";

export const checkQuickIntel = async (
  chainId: string,
  tokenAddress: string
) => {
  try {
    const config = {
      headers: {
        "X-QKNTL-KEY":
          process.env.QUICKINTEL_API_KEY || "fc7b0fa8183749dc8c05dfee748ce351",
        "Content-Type": "application/json",
      },
    };

    if (chainId == "ethereum") chainId = "eth";

    const response = await axios.post(
      "https://api.quickintel.io/v1/getquickiauditfull",
      {
        tokenAddress: tokenAddress,
        chain: chainId,
      },
      config
    );

    const status =
      response.data?.quickiAudit?.has_Suspicious_Functions === true ||
      response.data?.quickiAudit?.contract_Renounced === false ||
      response.data?.quickiAudit?.hidden_Owner === true ||
      response.data?.quickiAudit?.has_Obfuscated_Address_Risk === true ||
      response.data?.quickiAudit?.is_Transfer_Pausable === true ||
      response.data?.tokenDynamicDetails?.is_Honeypot === true ||
      response.data?.quickiAudit?.is_Proxy === true ||
      response.data?.quickiAudit?.can_Mint === true ||
      response.data?.quickiAudit?.has_Trading_Cooldown === true ||
      response.data?.quickiAudit?.can_Blacklist === true ||
      response.data?.quickiAudit?.can_Whitelist === true ||
      parseFloat(response.data?.tokenDynamicDetails?.buyTax || "0") > 10 ||
      parseFloat(response.data?.tokenDynamicDetails?.sellTax || "0") > 10;
    return { status, data: response.data };
  } catch (err: any) {
    if (err.response) {
      console.error("Error Status:", err.response);
    } else {
      console.error("Error Message:", err.message);
    }
  }
};
