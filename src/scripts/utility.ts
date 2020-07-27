export class C2_Utility {
    static addDots(data, woundMax = 0, valueAttribute = "value")
    {
        data.dots = [];
        for (let i = 0; i < woundMax; i++){
            data.dots.push({
                wounded : i + 1 <= getProperty(data, valueAttribute)
            })
        }

        if (getProperty(data, "max"))
        {
            for (let i = 0; i < woundMax; i++)
            {
                data.dots[i].locked = i +1 > getProperty(data, "max")
            }
        }

        if (data.treated)
        {
            for (let i = 0; i < data.treated; i++)
            {
                data.dots[i].treated = true
            }
        }

        return data
    }
}