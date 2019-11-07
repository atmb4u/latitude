/**
 * TEAM: frontend_infra
 *
 * @flow
 */

import * as React from "react";

import {css, StyleSheet} from "aphrodite";
import Text from "../../Text";
import Group from "../../Group";
import AnchorButton from "../../button/AnchorButton";

import componentsStatList from "../constants/componentsStatList.json";

const buildStats = () => {
  const stats = Object.keys(componentsStatList).reduce(
    (acc, key) => {
      const {uses, imports} = componentsStatList[key];
      return {
        components: acc.components + 1,
        uses: acc.uses + uses,
        imports: acc.imports + imports,
      };
    },
    {
      components: 0,
      imports: 0,
      uses: 0,
    }
  );
  return stats;
};

export default function Resources() {
  const stats = buildStats();
  return (
    <div className={css(styles.wrapper)}>
      <Group flexDirection="column" gap={128}>
        <section>
          <Group flexDirection="column" gap={32}>
            <Text scale="headline" weight="bold">
              Resources
            </Text>
            <div className={css(styles.demos)}>
              <article>
                <Group flexDirection="column" gap={12}>
                  <Text weight="bold">Latitude UI Library</Text>
                  <Text>
                    The Latitude UI Library consists of base-level elements,
                    components, and design patterns. This Figma file is our
                    global design system file and accessible by all teams.
                  </Text>
                  <AnchorButton
                    intent="basic"
                    kind="hollow"
                    href="https://www.figma.com/file/S4G3rNvzryThbvsCwxHRWV18/Components?node-id=0%3A1"
                    openInNewTab={true}
                    label="Latitude UI Library"
                  />
                </Group>
              </article>
              <article>
                <Group flexDirection="column" gap={12}>
                  <Text weight="bold">Flexport Design Repository</Text>
                  <Text>
                    The Flexport Design Repository houses core design team files
                    and also functions as the home of design issues. Open an
                    issue related to our FDK or anything in the domain of design
                    infrastructure.
                  </Text>
                  <AnchorButton
                    intent="basic"
                    kind="hollow"
                    href="https://github.com/flexport/latitude"
                    openInNewTab={true}
                    label="Browse the repo"
                  />
                </Group>
              </article>
              <article>
                <Group flexDirection="column" gap={12}>
                  <Text weight="bold">Work & Roadmap</Text>
                  <Text>
                    Our team tracks work, bugs, and ideas in our Jira project.
                    Our roadmap and work-in-progress may help other teams
                    understand our priorities and upcoming projects.
                  </Text>
                  <AnchorButton
                    intent="basic"
                    kind="hollow"
                    href="https://flexport.atlassian.net/secure/Roadmap.jspa?projectKey=LAT"
                    openInNewTab={true}
                    label="View Latitude Jira project"
                  />
                </Group>
              </article>
              <article>
                <Group flexDirection="column" gap={12}>
                  <Text weight="bold">Design Systems Information</Text>
                  <Text>
                    The Latitude confluence space houses our team`s OKRs,
                    proposals, meeting notes and work-in-progress guidelines.
                  </Text>
                  <AnchorButton
                    intent="basic"
                    kind="hollow"
                    href="https://flexport.atlassian.net/wiki/spaces/DE/overview"
                    openInNewTab={true}
                    label="View Latitude Confluence space"
                  />
                </Group>
              </article>
            </div>
          </Group>
        </section>
        <section algolia-id="docsearch-exclude">
          <Group flexDirection="column" gap={32}>
            <Text scale="headline" weight="bold">
              Stats
            </Text>
            <Group gap={36} alignItems="flex-end">
              <Group flexDirection="column" gap={8}>
                <Text scale="display" weight="bold">
                  {stats.components}
                </Text>
                <Text weight="bold">Components</Text>
              </Group>
              <Group flexDirection="column" gap={8}>
                <Text scale="display" weight="bold">
                  {stats.imports}
                </Text>
                <Text weight="bold">Imports</Text>
              </Group>
              <Group flexDirection="column" gap={8}>
                <Text scale="display" weight="bold">
                  {stats.uses}
                </Text>
                <Text weight="bold">Uses</Text>
              </Group>
              <AnchorButton
                intent="none"
                kind="hollow"
                href="https://app.periscopedata.com/app/flexport/309243/Kaye-Dashboard"
                openInNewTab={true}
                label="View more stats in Periscope"
              />
            </Group>
          </Group>
        </section>
      </Group>
    </div>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  demos: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gridColumnGap: "36px",
    gridRowGap: "64px",
  },
});
