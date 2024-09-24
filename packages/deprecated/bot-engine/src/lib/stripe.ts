export const initStripe = (document: Document): Promise<void> =>
  new Promise((resolve) => {
    const existingScript = document.getElementById("stripe-script");
    if (existingScript) return resolve();
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3";
    script.id = "stripe-script";
    document.body.appendChild(script);
    script.onload = () => {
      resolve();
    };
  });
