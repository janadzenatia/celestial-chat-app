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
        <h1 className="font-serif text-lg text-foreground">{t("legal.privacyTitle")}</h1>
      </div>

      <div className="px-5 py-6 max-w-lg mx-auto space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.dataCollectionTitle")}</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.
            Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.dataUseTitle")}</h2>
          <p>
            Cras mattis consectetur purus sit amet fermentum. Donec ullamcorper nulla non metus auctor fringilla.
            Maecenas sed diam eget risus varius blandit sit amet non magna.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.thirdPartyTitle")}</h2>
          <p>
            Aenean lacinia bibendum nulla sed consectetur. Nullam id dolor id nibh ultricies vehicula ut id elit.
            Etiam porta sem malesuada magna mollis euismod.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.securityTitle")}</h2>
          <p>
            Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.
            Integer posuere erat a ante venenatis dapibus posuere velit aliquet.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-base text-foreground">{t("legal.contactTitle")}</h2>
          <p>
            Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.
            Donec sed odio dui. Cras justo odio, dapibus ut facilisis in, egestas eget quam.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
