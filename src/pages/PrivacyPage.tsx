import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 glass border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-lg text-foreground">Privacy Policy</h1>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p className="text-xs">Effective Date: March 8, 2026</p>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">1. Data Collection</h2>
          <p>
            We collect your email for account creation and your birth details (date, time, and location) specifically to provide personalized astrological insights and family compatibility analysis.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">2. Data Usage</h2>
          <p>
            Your data is used solely within the app to generate AI-driven reports. We do not sell or share your personal data with third-party advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">3. Data Storage</h2>
          <p>
            Your information is securely stored via encrypted Authentication and Database services hosted on industry-standard cloud infrastructure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">4. User Rights</h2>
          <p>
            You can delete your account and all associated data at any time through the Profile settings within the app.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">5. Contact</h2>
          <p>
            For any privacy-related concerns, contact us at{" "}
            <a href="mailto:Natia_janadze@yahoo.com" className="text-primary hover:underline">
              Natia_janadze@yahoo.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
