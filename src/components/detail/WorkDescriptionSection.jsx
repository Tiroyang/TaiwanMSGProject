// src/components/detail/WorkDescriptionSection.jsx

import { FileText } from "lucide-react";

import DetailSection from "./DetailSection";
import SimpleMarkdown from "../common/SimpleMarkdown";

export default function WorkDescriptionSection({
    description,
}) {
    return (
        <DetailSection
            title="中文簡介"
            icon={<FileText size={14} />}
        >
            {description ? (
                <SimpleMarkdown text={description} />
            ) : (
                <span className="italic text-gray-500">
                    無描述
                </span>
            )}
        </DetailSection>
    );
}