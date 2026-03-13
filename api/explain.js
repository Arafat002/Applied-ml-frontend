export default async function handler(req, res) {
    try {

        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const { code } = req.body;

        const hfResponse = await fetch(
            "https://router.huggingface.co/hf-inference/models/Arafat002/codet5-python-explainer",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: code
                })
            }
        );

        const text = await hfResponse.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            throw new Error(text);
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({
            error: "Server error: " + error.message
        });
    }
}