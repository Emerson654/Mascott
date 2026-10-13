# Product lens
Score: 4/10 | Vote: FUND IF

## What is strong
- **One house style and one shared animation set** is the right call. It is a real act of saying no: no style picker, no custom rigging, no art pipeline. It keeps generation cheap and the output consistent, and consistency is where a brand comes from.
- **"Point at an element on the page"** is the only moment in the brief that is new. A character that physically shows a visitor where to click joins the agent and the mascot into one experience. Today's chat widgets cannot do it. This is the seed of the product.
- **The JS snippet install** is a believable first step. If it really is a single paste, the setup can feel effortless.

## What would kill it (the top 3, most dangerous first)
1. **The agent fails on the customer's own site, and the cute face makes the failure worse.** "Navigate, fill forms, search the catalogue, start a checkout, book a slot, trigger in-app actions" across Shopify, WooCommerce, Webflow, WordPress, Wix and custom SaaS apps means working inside thousands of DOMs, auth states and checkout flows the company does not control. That is the weakest join in the whole experience, and the brief says nothing about it. A plain chatbot that fails looks broken. An adorable mascot that cheerfully fills in the wrong form looks like a joke at the merchant's expense. The Product lens holds that a company owns the whole experience, and this one would not own the part where it breaks.
2. **There is no one thing.** The brief describes two products, a character generator and a general on-site agent, sold to five segments with six kinds of action. Ask for it in one sentence and you get a paragraph. A solo founder with about 5,000 EUR who builds all of that will ship six actions that each half work, not one that works brilliantly.
3. **The first five minutes are probably a setup chore, not a delight.** After the snippet goes in, the mascot knows nothing about the site. Someone has to feed it content, map the actions, grant permissions and test the flows. If the buyer has to do that work, the "no-code" promise fails at the first touch. If nobody does it, the agent cannot act. The brief does not describe this moment, and that moment is the product.

## The questions I would ask the founder
- Say it in one sentence, with no commas.
- Walk me through it second by second: a Shopify merchant pastes the snippet. What do they see at minute 1, minute 3 and minute 5? When does the mascot first do something useful on their real store?
- Which **one** action would you keep if you had to cut the other five?
- Is the mascot there for delight or for conversion? If you removed it, would buyers still pay for the agent? If you removed the agent, would they still pay for the mascot?
- What happens on screen when an action fails halfway through a checkout? Who gets the blame: you, the merchant or the LLM provider?
- How does the agent learn a site that changes its layout next week?
- Does a "soft, cocooning" style work for a B2B SaaS or a law firm, or have you already chosen your segment without saying so?
- Open questions nobody has numbers for yet: the success rate of each action on real third-party sites, the time it takes to set up a first useful mascot, and whether a mascot changes engagement compared with a standard widget.

## If FUND IF: the conditions
1. **Pick one platform and one action.** For example, Shopify plus "find the right product and point at it / add it to the cart." Drop the general agent for v1.
2. **Script the first five minutes and make them true.** Paste the snippet and, with no manual setup, the mascot has read the catalogue and correctly answers and points on the merchant's own store. Test it on real stores the team does not own.
3. **Design the failure state as carefully as the success state.** Every action has a graceful fallback that the mascot plays in character: it says it cannot do this and points to the right place.
4. **Own every touchpoint within the 3-month window.** That means the dashboard, the generation result, the widget, the billing email and the conversation log, all in the same house style. Any seam between them shows.
5. **Show proof before you widen scope.** Agree on a go/no-go measure with the board up front: the action success rate on stores the team has never seen. Do not expand to other platforms until it is met.
