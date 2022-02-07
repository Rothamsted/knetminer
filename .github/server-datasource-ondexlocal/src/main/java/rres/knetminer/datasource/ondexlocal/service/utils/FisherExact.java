// ContigencyTable.java
//
// (c) 1999-2001 PAL Development Core Team
//
// This package may be distributed under the
// terms of the Lesser GNU General Public License (LGPL)

package rres.knetminer.datasource.ondexlocal.service.utils;

/**
 * This does a one tail fisher exact test. It uses an array of factorials initialized at the beginning to provide
 * speed. There could be better ways to do this.
 *
 * @version $Id: FisherExact.java,v 1
 *
 * @author Ed Buckler
 */

public class FisherExact
{
	private double[] f;
	int maxSize;

	/**
	 * constructor for FisherExact table
	 *
	 * @param maxSize
	 *          is the maximum sum that will be encountered by the table (a+b+c+d)
	 */
	public FisherExact ( int maxSize )
	{
		this.maxSize = maxSize;
		f = new double[ maxSize + 1 ];
		f[ 0 ] = 0.0;
		for ( int i = 1; i <= this.maxSize; i++ )
			f[ i ] = f[ i - 1 ] + Math.log ( i );
	}

	/**
	 * calculates the P-value for this specific state
	 *
	 * @param a,b,c,d
	 *          are the four cells in a 2x2 matrix
	 * @return the P-value
	 */
	public final double getP ( int a, int b, int c, int d )
	{
		int n = a + b + c + d;
		if ( n > maxSize ) return Double.NaN;
		double p;
		p = ( f[ a + b ] + f[ c + d ] + f[ a + c ] + f[ b + d ] ) - ( f[ a ] + f[ b ] + f[ c ] + f[ d ] + f[ n ] );
		return Math.exp ( p );
	}

	/**
	 * calculates the one tail P-value for the Fisher Exact test This
	 *
	 * @param a,b,c,d
	 *          are the four cells in a 2x2 matrix
	 * @return the P-value
	 */
	public final double getCumlativeP ( int a, int b, int c, int d )
	{
		int min, i;
		int n = a + b + c + d;
		if ( n > maxSize ) return Double.NaN;
		double p = 0;
		p += getP ( a, b, c, d );
		if ( ( a * d ) >= ( b * c ) )
		{
			min = ( c < b ) ? c : b;
			for ( i = 0; i < min; i++ )
				p += getP ( ++a, --b, --c, ++d );
		}
		if ( ( a * d ) < ( b * c ) )
		{
			min = ( a < d ) ? a : d;
			for ( i = 0; i < min; i++ )
				p += getP ( --a, ++b, ++c, --d );
		}
		return p;
	}

}