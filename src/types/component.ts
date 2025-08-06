/**
 * TypeScript interfaces for component system
 */

export interface ComponentAttributes {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ComponentEvents {
  [eventName: string]: CustomEvent;
}

export interface ComponentConfig {
  tagName: string;
  observedAttributes?: string[];
  staticAttributes?: string[];
  dynamicAttributes?: string[];
  shadowOptions?: ShadowRootInit;
}

export interface LifecycleCallbacks {
  onConnect?(): void;
  onDisconnect?(): void;
  onAttributeChange?(name: string, oldValue: string | null, newValue: string | null): void;
  onAdopt?(): void;
}

export interface AccessibilityOptions {
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaLevel?: string;
  tabIndex?: number;
  focusable?: boolean;
}
