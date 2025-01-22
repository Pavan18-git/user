import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
export const dynamic = "force-dynamic"


// export async function POST(req: NextRequest) {
//     const { UserName, UserDisplayName, UserFullName, UserMobile, UserEmail, UserStatus } = await req.json();
//     const hashedPassword = await bcrypt.hash('1234567890!', 10);
//       const action = req.nextUrl.searchParams.get("action"); 
//     try {
//         const pool = await connectToDatabase();

//         if (!pool) {
//             return new NextResponse(JSON.stringify({ error: 'Database connection failed' }), {
//                 status: 500,
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             });
//         }

//         if (action === 'status') {
//             // Update existing user's status
//             const result = await pool.request()
//                 .input('UserName', sql.NVarChar(50), UserName)
//                 .input('UserStatus', sql.Int, UserStatus)
//                 .execute('UpdateUserStatus'); 
//             return NextResponse.json({ message: "User status updated successfully." }, { status: 200 });
//         } else {
//             const result = await pool.request()
//                 .input('UserName', sql.NVarChar(255), UserName)
//                 .input('UserDisplayName', sql.NVarChar(255), UserDisplayName)
//                 .input('UserFullName', sql.NVarChar(255), UserFullName)
//                 .input('UserMobile', sql.NVarChar(20), UserMobile)
//                 .input('UserEmail', sql.NVarChar(255), UserEmail)
//                 .input('UserPassword', sql.NVarChar(255), hashedPassword)
//                 .execute('SPA_InsertUser'); 
//             return NextResponse.json({ message: "User created successfully.", id: result.recordset[0].USER_ID }, { status: 201 });
//         }
//     } catch (error) {
//         console.error("Server error", error);
//         return NextResponse.json({ message: "User creation or update failed." }, { status: 403 });
//     }
// }
export async function POST(req: NextRequest) {
    const { UserName, UserDisplayName, UserFullName, UserMobile, UserEmail,UserStatus } = await req.json();
    const hashedPassword = await bcrypt.hash(process.env.NEXT_PUBLIC_DEFAULT_USER_PASSWORD || '1234', 10);
    const action = req.nextUrl.searchParams.get("action");
    try {
        const pool = await connectToDatabase();

        if (!pool) {
            return new NextResponse(JSON.stringify({ error: 'Database connection failed' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        const { searchParams } = req.nextUrl;
        const CreatedBy = searchParams.get("CreatedBy")

        if (action === 'status') {
            console.log("??????????????body")
            // Update existing user's status
            const result = await pool.request()
                .input('UserName', sql.NVarChar(50), UserName)
                .input('UserStatus', sql.NVarChar(10), UserStatus)
                .input('UpdatedBy', sql.Int, CreatedBy)
                .query(`UPDATE tbla_user SET UserStatus = @UserStatus,UpdatedBy = @UpdatedBy,UpdatedDate = GETDATE() WHERE UserName = @UserName`);
            return NextResponse.json({ message: "User status updated successfully." }, { status: 200 });
        } else {
            // Attempt to insert the new user
            try {
                const result = await pool.request()

                    // .input('CreatedBy', sql.Int, CreatedBy)
                    .input('UserName', sql.NVarChar(255), UserName)
                    .input('UserPassword', sql.NVarChar(255), hashedPassword)
                    .input('UserDisplayName', sql.NVarChar(255), UserDisplayName)
                    .input('UserFullName', sql.NVarChar(255), UserFullName)
                    .input('UserMobile', sql.NVarChar(20), UserMobile)
                    .input('UserEmail', sql.NVarChar(255), UserEmail)
                    .execute('SPA_InsertUser');

                return NextResponse.json({
                    message: "User created successfully.",
                    email: UserName, // Sending email in the response
                  }, { status: 201});
            } catch (err) {
                if (err instanceof sql.RequestError && err.number === 50000) {
                    return NextResponse.json({ message: "Username already exists." }, { status: 400 });
                }
                throw err; 
            }
        }
    } catch (error) {
        console.error("Server error", error);
        return NextResponse.json({ message: "User creation or update failed." }, { status: 500 });
    }
}


// GET: Retrieve users
export async function GET(req: NextRequest) {
    try {
        const pool = await connectToDatabase();

        if (!pool) {
            return new NextResponse(JSON.stringify({ error: 'Database connection failed' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const result = await pool.request()
            .execute('SPA_GetUsers');

        return NextResponse.json(result.recordset, { status: 200 });
    } catch (error) {
        console.log("Server error", error);
        return NextResponse.json({ message: "Failed to retrieve users." }, { status: 403 });
    }
}

// PUT: Update a user
export async function PUT(req: NextRequest) {
    const {
        UserName,
        UserFullName,
        UserEmail,
        UserMobile,
        UserDisplayName
    } = await req.json();

    console.log(UserName,
        UserFullName,
        UserEmail,
        UserMobile,
        UserDisplayName,">>>>>>>>>>>>>>>>>users")

    try {
        const pool = await connectToDatabase();

        if (!pool) {
            return new NextResponse(JSON.stringify({ error: 'Database connection failed' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const { searchParams } = req.nextUrl;
        const UpdatedBy = searchParams.get("CreatedBy")

        const result = await pool.request()
            .input('UpdatedBy', sql.Int, UpdatedBy)
            .input('UserName', sql.NVarChar(255), UserName)
            .input('UserFullName', sql.NVarChar(255), UserFullName)
            .input('UserEmail', sql.NVarChar(255), UserEmail)
            .input('UserMobile', sql.NVarChar(20), UserMobile)
            .input('UserDisplayName', sql.NVarChar(255), UserDisplayName)
            .query(`
                UPDATE tbla_user
                SET 
                UpdatedBy = @UpdatedBy,
                UpdatedDate = GETDATE(),
                UserFullName = @UserFullName,
                UserEmail = @UserEmail,
                UserMobile = @UserMobile,
                UserDisplayName = @UserDisplayName
                WHERE 
                    UserName = @UserName
            `);

        return NextResponse.json({ message: "User updated successfully." }, { status: 200 });
    } catch (error) {
        console.error("Server error", error);
        return NextResponse.json({ message: "User update failed." }, { status: 403 });
    }
}


// export async function PUT(req: NextRequest) {
//     const { USER_ID, FIRST_NAME, USER_NAME, ROLE, PASSWORD, STATUS } = await req.json();
//     // const hashedPassword = await bcrypt.hash(PASSWORD, 10);
// console.log(USER_ID, FIRST_NAME, USER_NAME, ROLE, PASSWORD, STATUS ,'>>>')
//     try {
//         const pool = await connectToDatabase();

//         if (!pool) {
//             return new NextResponse(JSON.stringify({ error: 'Database connection failed' }), {
//                 status: 500,
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             });
//         }

//         const result = await pool.request()
//             .input('USER_NAME', sql.NVarChar(50), USER_NAME)
//             .input('NAME', sql.NVarChar(50), FIRST_NAME)
//             .input('ROLE', sql.NVarChar(50), ROLE)
//             // .input('PASSWORD', sql.NVarChar(200), hashedPassword)
//             .query('UPDATE USERS SET FIRST_NAME=@NAME, ROLE=@ROLE WHERE USER_NAME=@USER_NAME');
//         return NextResponse.json({ message: "User updated successfully." }, { status: 200 });
//     } catch (error) {
//         console.log("Server error", error);
//         return NextResponse.json({ message: "User update failed." }, { status: 403 });
//     }
// }

// DELETE: Delete a user
export async function DELETE(req: NextRequest) {
    const { UserName } = await req.json();

    try {
        const pool = await connectToDatabase();

        if (!pool) {
            return new NextResponse(JSON.stringify({ error: 'Database connection failed' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const result = await pool.request()
            .input('UserName', sql.Int, UserName)
            .query(`Update TBLA_USER SET UserStatus = 'D' WHERE UserName=@UserName`);

        return NextResponse.json({ message: "User deleted successfully." }, { status: 200 });
    } catch (error) {
        console.log("Server error", error);
        return NextResponse.json({ message: "User deletion failed." }, { status: 403 });
    }
}
