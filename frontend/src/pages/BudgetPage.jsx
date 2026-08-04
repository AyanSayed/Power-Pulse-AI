import BudgetTracker from "../components/BudgetTracker";
import SlabJumpGuard from "../components/SlabJumpGuard";
import { useLanguage } from "../context/LanguageContext";
function BudgetPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-500 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold">{t("budgetTitle")}</h1>
        <p className="mt-3 text-teal-100 max-w-3xl leading-7">
          {t("budgetIntro")}
        </p>
      </div>

      <BudgetTracker />
      <SlabJumpGuard />
    </div>
  );
}

export default BudgetPage;
