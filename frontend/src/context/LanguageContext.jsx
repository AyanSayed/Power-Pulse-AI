import { createContext, useContext, useEffect, useState } from "react";

const LANGUAGE_KEY = "pp_language";

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
];

const messages = {
  en: {
    language: "Language",
    // add to en:
    greeting: "Good evening, {name} 👋",
    subtitle: "Here's your electricity overview for today.",
    notifications: "Notifications",
    profile: "Profile",
    logout: "Logout",
    gotIt: "Got it",
    nav_dashboard: "Dashboard", nav_bills: "Bills", nav_uploadBill: "Upload Bill",
    nav_dailyUsage: "Daily Usage", nav_billHistory: "Bill History", nav_billHealth: "Bill Health Check",
    nav_budget: "Budget", nav_aiInsights: "AI Insights", nav_insights: "Insights",
    nav_appliances: "Appliances", nav_auditMatrix: "Audit Matrix", nav_carbon: "Carbon Footprint",
    nav_usageTrends: "Usage Trends", nav_simulator: "Simulator", nav_energyTools: "Energy Tools",
    nav_acAdvisor: "AC Advisor", nav_profile: "Profile",
    noBillTitle: "No bill uploaded yet",
    noBillMessage: "Upload your first electricity bill to unlock AI insights and smart recommendations.",
    uploadBillAction: "Upload Bill",
    dashboard: "Dashboard", currentBill: "Current Bill", unitsConsumed: "Units Consumed", estimatedNextBill: "Estimated Next Bill", helpAssistant: "PowerPulse Guide", askGuide: "Ask about your bill or how to use PowerPulse…", send: "Send", guideWelcome: "Hi! I can explain your bill, estimate range, slab guard, and guide you to the right page.",
    budgetTitle: "Budget Tracker",
    budgetIntro: "Set a monthly spending target and PowerPulse will tell you exactly how much you can safely use each day to stay under it.",
    remainingBudget: "Remaining Budget Tracker",
    monthlyTarget: "Monthly target:",
    editTarget: "Edit target",
    save: "Save",
    cancel: "Cancel",
    budgetLoadError: "Couldn't load your budget tracker. Check back shortly.",
    overBudget: "You've already spent ₹{spent}, over your ₹{target} target with {days} days left this month.",
    safeAllowance: "To stay under ₹{target}, your safe daily allowance is {units} units (₹{amount}) per day for the next {days} days.",
    heatWarning: "It's {temp}°C right now — AC-driven days tend to run above this allowance, so keep an eye on today's usage.",
    slabGuard: "Slab Jump Guard",
    editReading: "Edit reading",
    manualReading: "Enter today's total units used — no smart meter needed.",
    unitsUsed: "Units used so far this cycle",
    daysElapsed: "Days elapsed in cycle",
    cycleDays: "Total days in billing cycle",
    update: "Update",
    dayUsage: "Day {elapsed} of {cycle} · {units} units used · currently in Slab {slab}",
    topSlab: "You're already in the top tariff slab. Your projected total is {projected} units this cycle.",
    breachSlab: "At your current pace you'll finish at {projected} units — crossing out of Slab {slab} (limit {ceiling}). To stay in this slab, limit yourself to {allowance} units/day for the remaining {days} days — saving roughly ₹{saving} versus your current trajectory.",
    safeSlab: "You have {left} units left in Slab {slab} for the next {days} days. Stay under {allowance} units/day and you won't cross into the next, pricier slab.",
  },
  hi: {
    language: "भाषा",
    greeting: "शुभ संध्या, {name} 👋",
    subtitle: "आज के लिए आपकी बिजली की जानकारी यहाँ है।",
    notifications: "सूचनाएं", profile: "प्रोफ़ाइल", logout: "लॉगआउट", gotIt: "समझ गया",
    nav_dashboard: "डैशबोर्ड", nav_bills: "बिल", nav_uploadBill: "बिल अपलोड करें",
    nav_dailyUsage: "दैनिक उपयोग", nav_billHistory: "बिल इतिहास", nav_billHealth: "बिल हेल्थ चेक",
    nav_budget: "बजट", nav_aiInsights: "AI इनसाइट्स", nav_insights: "इनसाइट्स",
    nav_appliances: "उपकरण", nav_auditMatrix: "ऑडिट मैट्रिक्स", nav_carbon: "कार्बन फुटप्रिंट",
    nav_usageTrends: "उपयोग रुझान", nav_simulator: "सिम्युलेटर", nav_energyTools: "ऊर्जा उपकरण",
    nav_acAdvisor: "AC सलाहकार", nav_profile: "प्रोफ़ाइल",
    noBillTitle: "अभी तक कोई बिल अपलोड नहीं हुआ",
    noBillMessage: "AI इनसाइट्स और सुझाव पाने के लिए अपना पहला बिजली बिल अपलोड करें।",
    uploadBillAction: "बिल अपलोड करें",
    dashboard: "डैशबोर्ड", currentBill: "वर्तमान बिल", unitsConsumed: "उपयोग की गई यूनिट", estimatedNextBill: "अगले बिल का अनुमान", helpAssistant: "PowerPulse गाइड", askGuide: "अपने बिल या PowerPulse इस्तेमाल करने के बारे में पूछें…", send: "भेजें", guideWelcome: "नमस्ते! मैं आपके बिल, अनुमान रेंज और स्लैब गार्ड को समझा सकता हूँ।",
    budgetTitle: "बजट ट्रैकर",
    budgetIntro: "मासिक खर्च का लक्ष्य तय करें। PowerPulse बताएगा कि बजट में रहने के लिए आप रोज़ कितनी बिजली सुरक्षित रूप से उपयोग कर सकते हैं।",
    remainingBudget: "बचा हुआ बजट",
    monthlyTarget: "मासिक लक्ष्य:",
    editTarget: "लक्ष्य बदलें",
    save: "सेव करें",
    cancel: "रद्द करें",
    budgetLoadError: "बजट ट्रैकर लोड नहीं हो सका। कृपया थोड़ी देर बाद कोशिश करें।",
    overBudget: "आप ₹{spent} खर्च कर चुके हैं, जो ₹{target} के लक्ष्य से अधिक है। इस महीने {days} दिन बाकी हैं।",
    safeAllowance: "₹{target} के अंदर रहने के लिए अगले {days} दिनों तक आपका सुरक्षित दैनिक उपयोग {units} यूनिट (₹{amount}) है।",
    heatWarning: "अभी तापमान {temp}°C है — एसी के कारण उपयोग बढ़ सकता है, इसलिए आज के उपयोग पर नज़र रखें।",
    slabGuard: "स्लैब जंप गार्ड",
    editReading: "रीडिंग बदलें",
    manualReading: "आज तक उपयोग की गई कुल यूनिट दर्ज करें — स्मार्ट मीटर की जरूरत नहीं है।",
    unitsUsed: "इस बिलिंग चक्र में अब तक उपयोग की गई यूनिट",
    daysElapsed: "चक्र में बीते दिन",
    cycleDays: "बिलिंग चक्र के कुल दिन",
    update: "अपडेट करें",
    dayUsage: "दिन {elapsed}/{cycle} · {units} यूनिट उपयोग · अभी स्लैब {slab} में",
    topSlab: "आप पहले ही सबसे ऊँचे टैरिफ स्लैब में हैं। इस चक्र का अनुमानित कुल उपयोग {projected} यूनिट है।",
    breachSlab: "मौजूदा गति पर आप {projected} यूनिट उपयोग करेंगे और स्लैब {slab} (सीमा {ceiling}) पार कर देंगे। इसी स्लैब में रहने के लिए अगले {days} दिनों तक उपयोग {allowance} यूनिट/दिन रखें — लगभग ₹{saving} बच सकते हैं।",
    safeSlab: "अगले {days} दिनों के लिए स्लैब {slab} में आपकी {left} यूनिट बाकी हैं। उपयोग {allowance} यूनिट/दिन से कम रखें ताकि महंगे अगले स्लैब में न जाएँ।",
  },
  mr: {
    language: "भाषा",
    // add to mr:
    greeting: "शुभ संध्याकाळ, {name} 👋",
    subtitle: "आजच्या तुमच्या वीज वापराची माहिती इथे आहे.",
    notifications: "सूचना", profile: "प्रोफाइल", logout: "लॉगआउट", gotIt: "समजले",
    nav_dashboard: "डॅशबोर्ड", nav_bills: "बिले", nav_uploadBill: "बिल अपलोड करा",
    nav_dailyUsage: "दैनंदिन वापर", nav_billHistory: "बिल इतिहास", nav_billHealth: "बिल हेल्थ चेक",
    nav_budget: "बजेट", nav_aiInsights: "AI इनसाइट्स", nav_insights: "इनसाइट्स",
    nav_appliances: "उपकरणे", nav_auditMatrix: "ऑडिट मॅट्रिक्स", nav_carbon: "कार्बन फूटप्रिंट",
    nav_usageTrends: "वापर कल", nav_simulator: "सिम्युलेटर", nav_energyTools: "ऊर्जा साधने",
    nav_acAdvisor: "AC सल्लागार", nav_profile: "प्रोफाइल",
    noBillTitle: "अद्याप कोणतेही बिल अपलोड केलेले नाही",
    noBillMessage: "AI इनसाइट्स आणि शिफारसी मिळवण्यासाठी तुमचे पहिले वीज बिल अपलोड करा.",
    uploadBillAction: "बिल अपलोड करा",
    dashboard: "डॅशबोर्ड", currentBill: "सध्याचे बिल", unitsConsumed: "वापरलेली युनिट", estimatedNextBill: "पुढील बिलाचा अंदाज", helpAssistant: "PowerPulse मार्गदर्शक", askGuide: "तुमच्या बिलाबद्दल किंवा PowerPulse वापराबद्दल विचारा…", send: "पाठवा", guideWelcome: "नमस्कार! मी तुमचे बिल, अंदाज श्रेणी आणि स्लॅब गार्ड समजावून सांगू शकतो।",
    budgetTitle: "बजेट ट्रॅकर",
    budgetIntro: "मासिक खर्चाचे लक्ष्य ठरवा. बजेटमध्ये राहण्यासाठी रोज किती वीज सुरक्षितपणे वापरता येईल ते PowerPulse सांगेल.",
    remainingBudget: "शिल्लक बजेट ट्रॅकर",
    monthlyTarget: "मासिक लक्ष्य:",
    editTarget: "लक्ष्य बदला",
    save: "जतन करा",
    cancel: "रद्द करा",
    budgetLoadError: "बजेट ट्रॅकर लोड झाला नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.",
    overBudget: "तुम्ही ₹{spent} खर्च केले आहेत, जे ₹{target} च्या लक्ष्यापेक्षा जास्त आहे. या महिन्यात {days} दिवस बाकी आहेत.",
    safeAllowance: "₹{target} च्या आत राहण्यासाठी पुढील {days} दिवस तुमचा सुरक्षित दैनिक वापर {units} युनिट (₹{amount}) आहे.",
    heatWarning: "सध्या तापमान {temp}°C आहे — एसीमुळे वापर वाढू शकतो, त्यामुळे आजच्या वापरावर लक्ष ठेवा.",
    slabGuard: "स्लॅब जंप गार्ड",
    editReading: "रीडिंग बदला",
    manualReading: "आजपर्यंत वापरलेले एकूण युनिट भरा — स्मार्ट मीटरची गरज नाही.",
    unitsUsed: "या बिलिंग सायकलमध्ये आतापर्यंत वापरलेले युनिट",
    daysElapsed: "सायकलमधील गेलेले दिवस",
    cycleDays: "बिलिंग सायकलमधील एकूण दिवस",
    update: "अपडेट करा",
    dayUsage: "दिवस {elapsed}/{cycle} · {units} युनिट वापरले · सध्या स्लॅब {slab} मध्ये",
    topSlab: "तुम्ही आधीच सर्वाधिक टॅरिफ स्लॅबमध्ये आहात. या सायकलचा अंदाजित एकूण वापर {projected} युनिट आहे.",
    breachSlab: "सध्याच्या वेगाने तुम्ही {projected} युनिट वापराल आणि स्लॅब {slab} (मर्यादा {ceiling}) ओलांडाल. याच स्लॅबमध्ये राहण्यासाठी पुढील {days} दिवस वापर {allowance} युनिट/दिवस ठेवा — सुमारे ₹{saving} वाचतील.",
    safeSlab: "पुढील {days} दिवसांसाठी स्लॅब {slab} मध्ये तुमची {left} युनिट बाकी आहेत. महागड्या पुढच्या स्लॅबमध्ये जाणे टाळण्यासाठी वापर {allowance} युनिट/दिवसपेक्षा कमी ठेवा.",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem(LANGUAGE_KEY) || "en");

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key, values = {}) => (messages[language]?.[key] || messages.en[key] || key)
    .replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
