import { UserEntity } from "src/modules/user/entities/user.entity";
import { stepupVestLogo } from "../../../utils/stepupVest-logo";


export function ResetPasswordEmail(user: UserEntity, code: string): string {
    return `
    <div style="word-spacing: normal; background-color: #d3e1f7; height: 100%">
    <table
      align="center"
      border="0"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="background-color: #f0f3f4; width: 100%; height: 100%"
    >
      <tbody>
        <tr>
          <td align="center">
            <div
              style="
                background: #f0f3f4;
                background-color: #f0f3f4;
                margin: 0px auto;
                max-width: 511px;
              "
            >
              <table
                align="center"
                border="0"
                cellpadding="0"
                cellspacing="0"
                role="presentation"
                style="
                  background-color: #ffffff;
                  width: 100%;
                  margin-top: 50px;
                  margin-bottom: 15px;
                  padding: 25px;
                "
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        font-size: 0px;
                        text-align: center;
                        vertical-align: middle;
                        text-align: center;
                      "
                    >
                    ${stepupVestLogo()}
                    
                    </td>
                    <td style="text-align: right">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 48 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                      >
                        <mask
                          id="mask0"
                          mask-type="alpha"
                          maskUnits="userSpaceOnUse"
                          x="0"
                          y="0"
                          width="48"
                          height="48"
                        >
                          <circle cx="24" cy="24" r="24" fill="#C4C4C4" />
                        </mask>
                        <g mask="url(#mask0)">
                          <rect
                            x="-9"
                            width="57"
                            height="92.1702"
                            fill="url(#pattern0)"
                          />
                        </g>
                        <defs>
                          <pattern
                            id="pattern0"
                            patternContentUnits="objectBoundingBox"
                            width="1"
                            height="1"
                          >
                            <use
                              xlink:href="#image0"
                              transform="translate(0 -0.000456348) scale(0.00578035 0.00357469)"
                            />
                          </pattern>
                          
                        </defs>
                      </svg>
                    </td>
                  </tr>
                  <tr>
                    <td
                      colspan="2"
                      style="padding: 40px 0px 10px 0px; font-weight: 1000"
                    >
                      Hello!
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-bottom: 110px; color: #808080">
                      <p>
                      You are receiving this email because you have forgotten your password and want to get back into your account through an app.
                      Here is your reset code below.
                      </p>
  
                    </td>
                  </tr>
                  <tr>
                    <td
                      colspan="2"
                      style="font-weight: 700; text-align: center; padding-bottom: 20px"
                    >
                      
                        <div>
                          ${code}
                        </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table style="text-align: center; padding-bottom: 30px">
                <tbody>
                  <tr>
                  <td>
                      
                  <p style="margin-top: 4px">
                  
                  Office: Suite 4, Kingsley Plaza, Taiwo Kein Fasuba, Governor's Rd, Ikotun 100211, Lagos. <br>
                  Phone: +2348171748663 (Mon-Fri from 9am-5pm) <br>
                  Email: support@stepupvest.com <br>
                  StepupVest, © 2023
                    
                  </p>
                </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>    
   `
}
