"use client";

import BrandMirror from "./BrandMirror";

/**
 * STYLE TAB — Brand Mirror (identity + visual style + polish)
 */

interface StyleTabProps {
  clientId: string;
  jwt: string;
  onStyleUpdated?: () => void;
}

export default function StyleTab({ clientId, jwt, onStyleUpdated }: StyleTabProps) {
  return <BrandMirror clientId={clientId} jwt={jwt} onStyleUpdated={onStyleUpdated} />;
}
