import { PiLineVerticalBold } from "react-icons/pi";
import SettingsNavigation from "~/components/SettingsNavigation";
import UnderConstruction from "~/components/UnderConstruction";
import { expectSession } from "~/server/auth";

export default async function Settings() {
  const session = await expectSession("/settings/feedback", {});

  return (
      <SettingsNavigation
        title="Feedback"
        pathname="/settings/feedback"
      >
        <UnderConstruction />
      </SettingsNavigation>
  );
}
