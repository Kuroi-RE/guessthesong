"use client";

import { useTranslation } from "react-i18next";
import { Clause, ContentPage } from "./content-page";

export function PrivacyView() {
  const { t } = useTranslation();
  return (
    <ContentPage title={t("privacy.title")} updated={t("privacy.updated")}>
      <Clause heading={t("privacy.ownerTitle")} body={t("privacy.ownerBody")} />
      <Clause
        heading={t("privacy.noAccountTitle")}
        body={t("privacy.noAccountBody")}
      />
      <Clause heading={t("privacy.localTitle")} body={t("privacy.localBody")} />
      <Clause
        heading={t("privacy.thirdPartyTitle")}
        body={t("privacy.thirdPartyBody")}
      />
      <Clause
        heading={t("privacy.noTrackingTitle")}
        body={t("privacy.noTrackingBody")}
      />
      <Clause
        heading={t("privacy.childrenTitle")}
        body={t("privacy.childrenBody")}
      />
    </ContentPage>
  );
}

export function TermsView() {
  const { t } = useTranslation();
  return (
    <ContentPage title={t("terms.title")} updated={t("terms.updated")}>
      <Clause heading={t("terms.acceptTitle")} body={t("terms.acceptBody")} />
      <Clause heading={t("terms.audioTitle")} body={t("terms.audioBody")} />
      <Clause
        heading={t("terms.catalogueTitle")}
        body={t("terms.catalogueBody")}
      />
      <Clause
        heading={t("terms.availabilityTitle")}
        body={t("terms.availabilityBody")}
      />
      <Clause heading={t("terms.fairUseTitle")} body={t("terms.fairUseBody")} />
      <Clause heading={t("terms.changesTitle")} body={t("terms.changesBody")} />
    </ContentPage>
  );
}
