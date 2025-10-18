declare module "react-simple-maps" {
    import * as React from "react";
  
    export const ComposableMap: React.ComponentType<any>;
    export const Geographies: React.ComponentType<any>;
    export const Geography: React.ComponentType<any>;
    export const ZoomableGroup: React.ComponentType<any>;
    export const Sphere: React.ComponentType<any>;
    export const Graticule: React.ComponentType<any>;
  }
  declare module "plotly.js-dist-min" {
    const Plotly: any;
    export default Plotly;
  }