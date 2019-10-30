/**
 * TEAM: frontend_infra
 * @flow
 */

import React from "react";
import {StyleSheet, css} from "aphrodite";
import Text from "../Text";

type Props = {|
  +value: ?(string | number),
  +secondaryValue?: ?(string | number),
  +tooltipText?: ?string,
  +verticalAlign?: "start" | "center" | "end",
  +horizontalAlign?: "start" | "center" | "end",
|};

export default function TextCell({
  value,
  secondaryValue,
  tooltipText,
  verticalAlign = "center",
  horizontalAlign = "start",
}: Props) {
  return (
    <div
      className={css(
        styles.container,
        verticalAlign === "start" && styles.verticalAlignStart,
        verticalAlign === "center" && styles.verticalAlignCenter,
        verticalAlign === "end" && styles.verticalAlignEnd,
        horizontalAlign === "start" && styles.horizontalAlignStart,
        horizontalAlign === "center" && styles.horizontalAlignCenter,
        horizontalAlign === "end" && styles.horizontalAlignEnd
      )}
      title={tooltipText}
    >
      {value ? (
        <Text overflow="hidden" textOverflow="ellipsis" >
          {value}
        </Text>
      ) : null}
      {secondaryValue ? (
        <Text
          overflow="hidden"
          textOverflow="ellipsis"

          color="grey50"
        >
          {secondaryValue}
        </Text>
      ) : null}
    </div>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  horizontalAlignStart: {
    textAlign: "left",
  },
  horizontalAlignCenter: {
    textAlign: "center",
  },
  horizontalAlignEnd: {
    textAlign: "right",
  },
  verticalAlignStart: {
    justifyContent: "flex-start",
  },
  verticalAlignCenter: {
    justifyContent: "center",
  },
  verticalAlignEnd: {
    justifyContent: "flex-end",
  },
});
