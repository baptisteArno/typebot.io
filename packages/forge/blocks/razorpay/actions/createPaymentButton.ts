import { createAction, option } from '@typebot.io/forge'
import { auth } from '../auth'
import { defaultCurrency, defaultThemeColor, defaultUidLabel, rzpScriptUrl } from '../constants'
import { baseOptions } from '../baseOptions'
import { convertToPaise } from '../lib/convertToPaise'

export const createPaymentButton = createAction({
  name: 'Payment Button',
  auth,
  baseOptions,
  options: option.object({
    orderId: option.string.layout({
      label: 'Order Id',
      moreInfoTooltip: 'Order ID generated using the Payment Order action',
      isRequired: true
    }),
    amount: option.string.layout({
      label: 'Amount',
      moreInfoTooltip: 'Amount to be paid, should be same as ',
      isRequired: true
    }),
    uid: option.string.layout({
      label: 'Transaction ID',
      moreInfoTooltip: 'Any unique id for the transaction'
    }),
    name: option.string.layout({
      accordion: 'Prefill Information',
      label: 'Payer Name',
      moreInfoTooltip: 'Name of the payer'
    }),
    email: option.string.layout({
      accordion: 'Prefill Information',
      label: 'Payer Email',
      moreInfoTooltip: 'Email of the payer'
    }),
    contact: option.string.layout({
      accordion: 'Prefill Information',
      label: 'Mobile Number',
      moreInfoTooltip: 'Mobile Number of the payer'
    }),
    savePaymentResponseInVariableId: option.string.layout({
      label: 'Save payment details',
      inputType: 'variableDropdown',
    }),
  }),
  run: {
    web: {
      displayEmbedBubble: {
        waitForEvent: {
          getSaveVariableId: ({ savePaymentResponseInVariableId }) =>
            savePaymentResponseInVariableId,
          parseFunction: () => {
            return {
              args: {},
              content: `
                rzp.on({
                  action: 'success',
                  callback: function(resp) {
                      continueFlow(JSON.stringify(resp))
                  }
              });
              `,
            }
          },
        },
        parseInitFunction: ({ options }) => {
          if (!options.amount || !parseInt(options.amount)) throw new Error('Missing Amount')
          if (!options.keyId) throw new Error('Missing Key')
          if (!options.orderId) throw new Error('Missing Order ID')

          return {
            args: {
              amount: convertToPaise(options.amount),
              keyId: options.keyId,
              orderId: options.orderId ?? '',
              uid: options.uid ?? null,
              name: options.name ?? null,
              email: options.email ?? null,
              contact: options.contact ?? null,
              currency: options.currency ?? defaultCurrency,
              companyLogo: options.companyLogo ?? null,
              companyName: options.companyName ?? null,
              themeColor: options.themeColor ?? defaultThemeColor,
              uidLabel: options.uidLabel ?? defaultUidLabel,
              rzpScriptUrl: rzpScriptUrl
            },
            content: `
            function TR() {
              // Store callbacks for different actions
              this.callbacks = {};
          
              // Method to handle "init" action
              this.init = function(callback) {
                  console.log('Initializing...');
                  window.rzp = this
                  const rzpScript = document.createElement('script'); 
                  rzpScript.src = rzpScriptUrl;
                  rzpScript.onload = function() {
  
                    const rzpButton = document.createElement('button'); 
                    rzpButton.classList.add("py-2", "px-4", "font-semibold", "focus:outline-none", "filter", "hover:brightness-90", "active:brightness-75", "disabled:opacity-50", "disabled:cursor-not-allowed", "disabled:brightness-100", "flex", "justify-center", "typebot-button", "w-full"); 
                    rzpButton.textContent = "Pay";
  
                    var rzpoptions = {
                      "key": keyId, 
                      "amount": amount, 
                      "currency": currency,
                      "name": companyName,
                      "description": companyName,
                      "image": companyLogo,
                      "order_id": orderId, 
                      "prefill": { 
                          "name": name,
                          "email": email, 
                          "contact": contact 
                      },
                      "handler": function (response) {

                        rzpButton.disabled = true;
                        rzpButton.classList.replace("typebot-button", "typebot-guest-bubble")

                        if (rzp.callbacks['success']) {
                          rzp.callbacks['success'](response);
                        }
                      },
                      "notes": {
                          uidLabel: uid
                      },
                      "theme": {
                          "color": themeColor
                      }
                    };
                    var rzp1 = new Razorpay(rzpoptions);
                    
                    rzpButton.onclick = function(e){
                        rzp1.open();
                        e.preventDefault();
                    }
  
                    typebotElement.appendChild(rzpButton);
                    callback();
                    
                }
                typebotElement.appendChild(rzpScript);
              };
          
              // Method to handle "on" action
              this.on = function(options) {
                  if (options && options.action && options.callback) {
                      
                      // Store the callback for the specified action
                      this.callbacks[options.action] = options.callback;
                  } else {
                      console.error('Invalid "on" action configuration');
                  }
              };
          
            }
            
            const rzp1 = new TR();
            
            rzp1.init(function() {
                console.log('Initialization complete');
            });
         
          `,
          }
        },
      },
    },
  },
})
