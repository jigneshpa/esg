import { countries } from "@/utils/countries-with-abbrevations";

interface CountryFlagProps {
    country: string;
    height?: string;
    width?: string;
    style?: React.CSSProperties;
}

export const CountryFlag = ({ country, height, width, style }: CountryFlagProps) => {
    const abbreviation = countries[country as keyof typeof countries];
    if (!abbreviation || !country) return null;
    return <img src={`/countries/${abbreviation.toLowerCase()}.svg`} alt={country} height={height} width={width} style={style} />;
};