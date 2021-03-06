import core, {
  resolveConfig,
  TailwindConfig,
  createTwClassDictionary,
} from "@xwind/core";

import { Logger } from "typescript-template-language-service-decorator";
import importFresh from "import-fresh";
import initClassUtilities from "@xwind/class-utilities";
import { Root } from "postcss";

export default function xwind(config: TailwindConfig) {
  const resolvedConfig = resolveConfig(config);
  const {
    screens,
    variants,
    generateTwClassSubstituteRoot,
    utilitiesRoot,
    componentsRoot,
    baseRoot,
  } = core(resolvedConfig);

  const twClassDictionary = {
    XWIND_BASE: createTwClassDictionary(baseRoot).XWIND_GLOBAL,
    ...createTwClassDictionary(componentsRoot, utilitiesRoot),
  };

  const twClassUtilities = initClassUtilities(resolvedConfig.separator, [
    ...screens,
    ...variants,
  ]);

  const generateCssFromText = (text: string) => {
    const parsedClasses = twClassUtilities.parser(text);

    const roots: Root[] = [];
    for (const parsedClass of parsedClasses) {
      roots.push(generateTwClassSubstituteRoot(twClassDictionary, parsedClass));
    }
    return roots;
  };

  return {
    twClassDictionary,
    screens,
    variants,
    generateCssFromText,
  };
}

export function requireTailwindConfig(
  logger: Logger,
  configPath?: string
): TailwindConfig {
  try {
    const config = configPath
      ? importFresh(configPath)
      : require("tailwindcss/defaultConfig");
    return config;
  } catch (err) {
    logger.log(`Tailwind config file not found '${configPath}' | ${err}`);
    return require("tailwindcss/defaultConfig");
  }
}
