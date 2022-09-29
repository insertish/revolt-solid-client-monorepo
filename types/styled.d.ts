import "solid-styled-components";

declare module "solid-styled-components" {
  export interface DefaultTheme {
    colours: {
      [key in
        | 'accent'
        | 'foreground'
        | `foreground-${100 | 200 | 300 | 400}`
        | 'background'
        | `background-${100 | 200 | 300 | 400}`
        | 'success'
        | 'warning'
        | 'error'
        | `status-${'online' | 'idle' | 'focus' | 'busy' | 'streaming' | 'invisible'}`]: string;
    };
    breakpoints: {
      [key in 'sm' | 'md' | 'lg' | 'xl']: string;
    };
    borderRadius: {
      [key in 'md' | 'lg']: string;
    };
    gap: {
      [key in 'sm' | 'md' | 'lg']: string;
    };
    fonts: {
      [key in 'primary']: string;
    };
  }
}
