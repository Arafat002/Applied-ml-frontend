export default async function handler(req, res) {
    try {

        if (req.method !== "POST") {
            return res.status(405).json({ error: "Method not allowed" });
        }

        const { code } = req.body;

        const hfResponse = await fetch(
            "https://arafat002-codet5-python-explainer.hf.space/run/explain_code",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data: [code]
                })
            }
        );

        const data = await hfResponse.json();

        return res.status(200).json({
            generated_text: data.data[0]
        });

    } catch (error) {

        return res.status(500).json({
            error: "Server error: " + error.message
        });

    }
}