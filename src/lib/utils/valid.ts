import type { ErrorMessage } from "$lib/types";
import { error } from "@sveltejs/kit";

export function CheckSubject(tags: string): [boolean, ErrorMessage[]]
{
    const errors: ErrorMessage[] = [];

    // 2.1.1.1
    const regex = /^\[[A-Z0-9\-_+\/]{1,10}\]\[[A-Z0-9\-_+\/]{1,10}\]/;
    if (!regex.test(tags))
    {
        errors.push({
            message: "The subject must start with two tags in the format '[TAG1][TAG2]'.",
            category: "2.1.1.1"
        });
    }

    // Check for space after second tag
    if (tags.replace(regex, "")[0] !== " ")
    {
        errors.push({
            message: "There must be a space after the second tag.",
            category: "2.1.1.1"
        });
    }

    // 2.1.1.2
    if (tags.length > 80)
    {
        errors.push({
            message: "The length of the subject, including both tags and summary, must not exceed 80 characters.",
            category: "2.1.1.2"
        });
    }

    return [errors.length == 0, errors];
}

export async function CheckBody(body: string) : Promise<[boolean, ErrorMessage[]]>
{
    const body_lines = body.split("\n");
    let errors: ErrorMessage[] = [];

    if (body_lines.length < 2)
    {
        errors.push({
            message: "The body is too short",
            category: ""
        });
        return [errors.length == 0, errors];
    }

    // 2.2.1.1
    if (!IsGreeting(body_lines[0]))
    {
        errors.push({
            message: "The first line of the body must be a greeting.",
            category: "2.2.1.1"
        });
    }

    if (body_lines[1] !== "")
    {
        errors.push({
            message: "The second line of the body must be empty.",
            category: "2.2.1.1"
        });
    }

    // Go to end greeting
    const [end_greeting, e] = await CheckEndGreeting(body_lines, errors);

    if (end_greeting == -1)
    {
        errors.push({
            message: "The end greeting was not found.",
            category: ""
        });
    }
    errors = e;

    errors = await CheckBodyWidth(body_lines, end_greeting, errors);
    errors = await CheckTrailingWhiteSpaces(body_lines, errors);

    return [errors.length == 0, errors];
}

function CheckEndGreeting(body_lines: string[], errors: ErrorMessage[]) : Promise<[number, ErrorMessage[]]>
{
    return new Promise((resolve, reject) => {
        for (let i = 2; i < body_lines.length; i++)
        {
            if (IsGreeting(body_lines[i]))
            {
                // Check that above line is empty
                if (body_lines[i - 1] !== "")
                {
                    errors.push({
                        message: "There must be an empty line between the greeting and the body.",
                        category: "2.2.1.1"
                    });
                }

                // Check that below line is empty
                if (body_lines[i + 1] !== "")
                {
                    errors.push({
                        message: "There must be an empty line between the greeting and the signature.",
                        category: "2.2.1.1"
                    });
                }

                // Check that i + 2 is signature delimiter
                if (body_lines[i + 2] !== "-- ")
                {
                    errors.push({
                        message: "The signature delimiter '-- ' was not found after the greeting.",
                        category: "2.2.1.1"
                    });
                }
                else
                {
                    // Check that there is no empty line after signature delimiter
                    for (let j = i + 3; j < body_lines.length; j++)
                    {
                        if (body_lines[j] == "")
                        {
                            errors.push({
                                message: "There must be no empty lines after the signature delimiter.",
                                category: "2.2.1.1"
                            });
                        }
                    }
                }

                resolve([i, errors]);
                return;
            }

            if (i == body_lines.length - 1)
            {
                errors.push({
                    message: "The greeting was not found.",
                    category: "2.2.1.1"
                });
                resolve([-1, errors]);
                return;
            }
        }
    });
}

function CheckBodyWidth(body_lines: string[], body_end: number, errors: ErrorMessage[]) : Promise<ErrorMessage[]>
{
    // 2.2.2.1
    return new Promise((resolve, reject) => {
        for (let i = 2; i < body_end; i++)
        {
            const is_quoted = body_lines[i][0] == ">";
            if (is_quoted)
            {
                if (body_lines[i].length > 80)
                {
                    errors.push({
                        message: `Quoted lines must not exceed 80 characters (${body_lines[i].length}).`,
                        category: "2.2.2.1"
                    });
                }
            }
            else
            {
                if (body_lines[i].length > 72)
                {
                    errors.push({
                        message: `Unquoted lines must not exceed 72 characters (${body_lines[i].length}).`,
                        category: "2.2.2.1"
                    });
                }
            }

            if (body_lines[i].length < 60 && body_lines[i].length > 1)
            {
                errors.push({
                    message: `Lines ${i + 1} must not be less than 60 characters (${body_lines[i].length}).`,
                    category: "2.2.2.1"
                });
            }

            if (i == body_end - 1)
            {
                resolve(errors);
                return;
            }
        }
    });
}

function CheckTrailingWhiteSpaces(body_lines: string[], errors: ErrorMessage[]) : Promise<ErrorMessage[]>
{
    return new Promise((resolve, reject) => {
        for (let i = 0; i < body_lines.length; i++)
        {
            if (body_lines[i].endsWith(" ") && body_lines[i] != "-- ")
            {
                errors.push({
                    message: `Line ${i + 1} has trailing white spaces.`,
                    category: "2.2.2.5"
                });
            }

            if (i == body_lines.length - 1)
            {
                resolve(errors);
                return;
            }
        }
    });

}

function IsGreeting(str: string) : boolean
{
    // multiples word followed by comma only things on line
    const regex = /^[A-Za-z -]+,$/;
    return regex.test(str);
}