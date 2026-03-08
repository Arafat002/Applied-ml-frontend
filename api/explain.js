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
                    inputs: "explain: " + code
                })
            }
        );

        const data = await hfResponse.json();

        return res.status(200).json(data);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error: " + error.message
        });
    }
}