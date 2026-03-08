export default async function handler(req, res) {
    const code = req.body.code;

    const response = await fetch(
        "https://api-inference.huggingface.co/models/Arafat002/codet5-python-explainer",
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: "explain: " + code
            })
        }
    );

    const result = await response.json();

    res.status(200).json(result);
}