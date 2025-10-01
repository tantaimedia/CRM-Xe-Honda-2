import { GoogleGenAI, Type } from "@google/genai";
import { AiSuggestion } from "../types";

// Per coding guidelines, the API key is assumed to be available from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOCK_SUGGESTION: AiSuggestion = {
    analysis: "Khách hàng có thể đang gặp rào cản về tài chính hoặc cần thêm thông tin để so sánh và ra quyết định. Họ là người cẩn trọng.",
    consultingStrategies: [
        "Đồng cảm với lo ngại của khách hàng về giá.",
        "Phân tích chi tiết lợi ích dài hạn của xe: tiết kiệm xăng, độ bền, chi phí bảo dưỡng thấp.",
        "Giới thiệu chương trình trả góp 0% hoặc các gói vay ưu đãi.",
    ],
    promotionIdeas: [
        "Tặng gói bảo dưỡng miễn phí 1 năm.",
        "Giảm giá trực tiếp trên phụ kiện đi kèm (mũ bảo hiểm, áo mưa).",
        "Tặng voucher mua sắm tại cửa hàng.",
    ],
};


export const getSalesSuggestions = async (reason: string): Promise<AiSuggestion> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Một khách hàng đang cân nhắc mua xe máy Honda nhưng chưa chốt vì lý do sau: "${reason}". 
            Hãy phân tích tâm lý khách hàng và đưa ra đề xuất cho nhân viên tư vấn. Trả lời bằng tiếng Việt.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: {
                            type: Type.STRING,
                            description: "Phân tích ngắn gọn về tâm lý hoặc rào cản của khách hàng.",
                        },
                        consultingStrategies: {
                            type: Type.ARRAY,
                            description: "Các chiến lược, cách nói chuyện cụ thể để nhân viên tư vấn áp dụng.",
                            items: { type: Type.STRING }
                        },
                        promotionIdeas: {
                            type: Type.ARRAY,
                            description: "Các ý tưởng khuyến mãi, ưu đãi phù hợp để thuyết phục khách hàng.",
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AiSuggestion;
    } catch (error) {
        console.error("Error fetching Gemini suggestions:", error);
        return MOCK_SUGGESTION;
    }
};

export const getDailyHoroscope = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Đưa ra một lời khuyên hoặc nhận định ngắn gọn (2-3 câu) về ngày hôm nay cho một nhân viên bán hàng xe máy. Giọng văn tích cực, tạo động lực. Trả lời bằng tiếng Việt.`
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching daily horoscope:", error);
        return "Gặp sự cố khi kết nối AI. Hãy luôn giữ tinh thần lạc quan nhé!";
    }
};

export const getColorFengShui = async (birthYear: string): Promise<string> => {
    if(!birthYear || isNaN(parseInt(birthYear))) {
        return "Vui lòng nhập năm sinh hợp lệ.";
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Dựa vào phong thủy ngũ hành, người sinh năm ${birthYear} hợp với những màu sắc nào nhất khi mua xe? Giải thích ngắn gọn tại sao. Trả lời bằng tiếng Việt.`
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching color feng shui:", error);
        return "Không thể lấy dữ liệu phong thủy lúc này.";
    }
}
