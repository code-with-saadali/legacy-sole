import Image, { type ImageProps } from "next/image";

export default function ProductImage(props: ImageProps) {
  const source = props.src || "/images/shoes/runner-cutout.png";
  const external =
    typeof source === "string" && /^(https?:|data:)/.test(source);
  return (
    <Image
      {...props}
      alt={props.alt}
      src={source}
      unoptimized={external || props.unoptimized}
    />
  );
}
