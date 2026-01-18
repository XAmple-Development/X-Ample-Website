import { colorsTuple, createTheme } from "@mantine/core";

export function buildTheme(runtimeSettings) {
  const s = runtimeSettings?.theme?.settings || {};
  const borderRadius = s.global_border_radius || 4;
  const primaryHex = s.primary || "#1A98CE";
  const primaryAltHex = s.primary_alt || "#0E1118";
  const backgroundHex = s.background || "#0A0A11";
  const backgroundAltHex = s.background_alt || "#182030";
  const secondaryHex = s.secondary || "#D5471C";
  const siteContainerWidth = s.site_container_width || 1200;
  return createTheme({
    colors: {
      primary: colorsTuple(primaryHex),
      primary_alt: colorsTuple(primaryAltHex),
      secondary: colorsTuple(secondaryHex),
      background: colorsTuple(backgroundHex),
      background_alt: colorsTuple(backgroundAltHex)
    },
    defaultRadius: borderRadius,
    components: {
      Container: {
        defaultProps: {
          size: siteContainerWidth
        }
      },
      Anchor: {
        defaultProps: {
          td: "none",
        }
      },
      Title: {
        defaultProps: {
          c: s.title_color
        }
      },
      Text: {
        defaultProps: {
          c: s.text_color
        }
      },
      MultiSelect: {
        defaultProps: {
          clearable: true,
          searchable: true,
        }
      },
      Tooltip: {
        defaultProps: {
          withArrow: true,
        }
      },
      Button: {
        defaultProps: {
          color: "var(--mantine-color-primary-5)",
          variant: "primary"
        },
      },
      NumberFormatter: {
        defaultProps: {
          thousandSeparator: s.number_formatting?.settings?.thousands_separator,
          decimalSeparator: s.number_formatting?.settings?.decimal_separator,
          decimalScale: 2
        }
      },
      Modal: {
        defaultProps: {
          centered: true
        },
        styles: {
        }
      }
    }
  });
}

export const theme = buildTheme();