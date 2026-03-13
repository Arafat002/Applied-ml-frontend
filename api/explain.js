export default async function handler(req, res) {
    try {

        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const { code } = req.body;

        const response = await fetch(
            "https://arafat002-codet5-python-explainer.hf.space/run/explain_code",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    code: code
                })
            }
        );

        const data = await response.json();

        console.log("HF SPACE RESPONSE:", data);

        // Gradio Spaces usually return:
        // { data: ["explanation text"] }

        if (data.data) {
            return res.status(200).json({
                generated_text: Array.isArray(data.data) ? data.data[0] : data.data
            });
        }

        return res.status(500).json({
            error: "Invalid response from Hugging Face Space",
            raw: data
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });

    }
}