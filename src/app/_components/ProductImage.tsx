import Image, { type ImageProps } from "next/image";

export default function ProductImage(props: ImageProps) {
  const original =
    props.src ||
    "https://pub-bbec48a9985d48a988fd956df7da148b.r2.dev/legacy-sole/images/shoes/runner-cutout.png";
  const source =
    typeof original === "string" && original.startsWith("/images/")
      ? "https://pub-bbec48a9985d48a988fd956df7da148b.r2.dev/legacy-sole" +
        original
      : original;
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
